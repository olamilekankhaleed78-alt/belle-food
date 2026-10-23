import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { assertAdminApiSession } from "@/lib/admin-session";

export async function GET() {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const [{ totalRevenueKobo, orderCount, preparingCount }] = await db
    .select({
      totalRevenueKobo: sql<number>`coalesce(sum(${orders.totalKobo}), 0)`,
      orderCount: sql<number>`count(*)`,
      preparingCount: sql<number>`coalesce(sum(case when ${orders.status} = 'preparing' then 1 else 0 end), 0)`,
    })
    .from(orders);

  return NextResponse.json({ totalRevenueKobo, orderCount, preparingCount });
}
