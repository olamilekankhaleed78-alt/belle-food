import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, orderItems, orders, settings } from "@/db/schema";
import { assertAdminApiSession } from "@/lib/admin-session";
import { formatNairaFromKobo } from "@/lib/currency";
import { orderPayloadSchema, updateOrderStatusSchema } from "@/lib/validators";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET() {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const ids = list.map((order) => order.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : [];

  const merged = list.map((order) => ({
    ...order,
    items: items.filter((item) => item.orderId === order.id),
  }));

  return NextResponse.json({ orders: merged });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid order payload", issues: parsed.error.issues }, { status: 400 });
  }

  const aggregatedByItemId = parsed.data.items.reduce<Map<number, number>>((acc, line) => {
    acc.set(line.itemId, (acc.get(line.itemId) ?? 0) + line.quantity);
    return acc;
  }, new Map());

  const uniqueItemIds = Array.from(aggregatedByItemId.keys());

  // SECURITY FIX: Recompute totals straight from Neon DB records. Never trust raw client financial configurations.
  const dbItems = await db
    .select()
    .from(menuItems)
    .where(and(inArray(menuItems.id, uniqueItemIds), eq(menuItems.isAvailable, true)));

  if (dbItems.length !== uniqueItemIds.length) {
    return NextResponse.json(
      { message: "One or more items are unavailable or invalid. Refresh menu and try again." },
      { status: 400 },
    );
  }

  const itemMap = new Map(dbItems.map((item) => [item.id, item]));

  const settingsRows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ["serviceFeeKobo", "kitchenWhatsApp"]));

  const serviceFeeKobo = Number(settingsRows.find((s) => s.key === "serviceFeeKobo")?.value ?? "0") || 0;
  const kitchenWhatsApp =
    settingsRows.find((s) => s.key === "kitchenWhatsApp")?.value ?? process.env.KITCHEN_WHATSAPP_NUMBER ?? "";

  const lineItems = uniqueItemIds.map((itemId) => {
    const menuItem = itemMap.get(itemId);
    if (!menuItem) {
      throw new Error("Item lookup integrity failure");
    }
    if (!Number.isInteger(menuItem.priceKobo) || menuItem.priceKobo <= 0) {
      throw new Error("Invalid menu pricing configuration");
    }
    const quantity = aggregatedByItemId.get(itemId) ?? 0;
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Invalid item quantity");
    }

    const lineTotalKobo = quantity * menuItem.priceKobo;
    return {
      menuItemId: menuItem.id,
      itemTitle: menuItem.title,
      unitPriceKobo: menuItem.priceKobo,
      quantity,
      lineTotalKobo,
    };
  });

  const subtotalKobo = lineItems.reduce((acc, line) => acc + line.lineTotalKobo, 0);
  const totalKobo = subtotalKobo + serviceFeeKobo;

  if (!Number.isInteger(subtotalKobo) || subtotalKobo <= 0 || !Number.isInteger(totalKobo) || totalKobo <= 0) {
    return NextResponse.json({ message: "Order total validation failed" }, { status: 400 });
  }

  const createdOrder = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        fulfillmentType: parsed.data.fulfillmentType,
        notes: parsed.data.notes,
        subtotalKobo,
        serviceFeeKobo,
        totalKobo,
        status: "preparing",
      })
      .returning();

    await tx.insert(orderItems).values(
      lineItems.map((line) => ({
        orderId: order.id,
        ...line,
      })),
    );

    return order;
  });

  const itemSummary = lineItems.map((line) => `${line.itemTitle} x${line.quantity}`).join(", ");

  const customerTemplate = `🍔 *BELLE FOOD BY KING MITCHY* 🍔\nThank you for your order, ${parsed.data.customerName}! Your culinary journey is being prepared at our Lekki kitchen.\n\n📜 *ORDER DETAILS:*\n• *Order ID:* #${createdOrder.id.slice(0, 8)}\n• *Items:* ${itemSummary}\n• *Total Amount:* ${formatNairaFromKobo(createdOrder.totalKobo)}\n\n📍 *Status:* Kitchen Preparing 👨‍🍳\nWe operate 24/7! If you have any delivery adjustments, reply directly to this line.\n\n✨ _Taste the luxury of authentic Nigerian cuisine._`;

  const kitchenTemplate = `🚨 *NEW LIVE ORDER RECEIVED* 🚨\n\n• *Customer:* ${parsed.data.customerName} (${parsed.data.customerPhone})\n• *Fulfillment Type:* ${parsed.data.fulfillmentType.toUpperCase()}\n• *Items ordered:* ${itemSummary}\n\n👉 _Log into the Admin Portal (https://bellefood.ng) to assign a delivery rider and mark as dispatched._`;

  // FIXED: Collect tasks into a Promise matrix. Blocks serverless thread timeout until messages are dispatched completely.
  const notificationTasks = [
    sendWhatsAppMessage({ to: parsed.data.customerPhone, message: customerTemplate }),
    ...(kitchenWhatsApp ? [sendWhatsAppMessage({ to: kitchenWhatsApp, message: kitchenTemplate })] : []),
  ];

  const notificationResults = await Promise.allSettled(notificationTasks);
  const notifications = {
    attempted: notificationTasks.length,
    fulfilled: notificationResults.filter((result) => result.status === "fulfilled").length,
    rejected: notificationResults.filter((result) => result.status === "rejected").length,
  };

  return NextResponse.json({ ok: true, orderId: createdOrder.id, notifications }, { status: 201 });
}

export async function PUT(request: Request) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update payload" }, { status: 400 });
  }

  const updated = await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, parsed.data.orderId))
    .returning();

  return NextResponse.json({ order: updated[0] });
}

export async function DELETE(request: Request) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ message: "orderId is required" }, { status: 400 });
  }

  await db.delete(orders).where(eq(orders.id, orderId));
  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  const [{ totalRevenueKobo, orderCount }] = await db
    .select({
      totalRevenueKobo: sql<number>`coalesce(sum(${orders.totalKobo}), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(orders);

  return NextResponse.json({ totalRevenueKobo, orderCount });
}
