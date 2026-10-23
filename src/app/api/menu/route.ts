import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { assertAdminApiSession } from "@/lib/admin-session";
import { nairaToKobo } from "@/lib/currency";
import { seedMenuIfEmpty } from "@/db/seed-data";
import { menuInputSchema } from "@/lib/validators";

export async function GET() {
  await seedMenuIfEmpty();
  const items = await db.select().from(menuItems).orderBy(asc(menuItems.id));
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = menuInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await db
    .insert(menuItems)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      slug: parsed.data.slug,
      imagePath: parsed.data.imagePath,
      priceKobo: nairaToKobo(parsed.data.priceNaira),
      isSpicy: parsed.data.isSpicy,
      isVegan: parsed.data.isVegan,
      isAvailable: parsed.data.isAvailable,
    })
    .returning();

  revalidateTag("menu", "max");
  return NextResponse.json({ item: created[0] }, { status: 201 });
}
