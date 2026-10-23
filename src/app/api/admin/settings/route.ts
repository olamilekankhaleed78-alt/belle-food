import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { assertAdminApiSession } from "@/lib/admin-session";
import { nairaToKobo } from "@/lib/currency";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return NextResponse.json({
    kitchenWhatsApp: map.kitchenWhatsApp ?? "",
    serviceFeeNaira: Number(map.serviceFeeKobo ?? "0") / 100,
  });
}

export async function PUT(request: Request) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid settings payload" }, { status: 400 });
  }

  if (typeof parsed.data.kitchenWhatsApp === "string") {
    await db
      .insert(settings)
      .values({ key: "kitchenWhatsApp", value: parsed.data.kitchenWhatsApp, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: parsed.data.kitchenWhatsApp, updatedAt: new Date() },
      });
  }

  if (typeof parsed.data.serviceFeeNaira === "number") {
    const kobo = nairaToKobo(parsed.data.serviceFeeNaira);
    await db
      .insert(settings)
      .values({ key: "serviceFeeKobo", value: String(kobo), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(kobo), updatedAt: new Date() },
      });
  }

  const updated = await db.select().from(settings).where(eq(settings.key, "serviceFeeKobo"));

  return NextResponse.json({ ok: true, serviceFeeKobo: updated[0]?.value ?? "0" });
}
