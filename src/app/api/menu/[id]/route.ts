import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { assertAdminApiSession } from "@/lib/admin-session";
import { nairaToKobo } from "@/lib/currency";
import { menuInputSchema } from "@/lib/validators";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = menuInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await db
    .update(menuItems)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      slug: parsed.data.slug,
      imagePath: parsed.data.imagePath,
      priceKobo: nairaToKobo(parsed.data.priceNaira),
      isSpicy: parsed.data.isSpicy,
      isVegan: parsed.data.isVegan,
      isAvailable: parsed.data.isAvailable,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, parsedId))
    .returning();

  revalidateTag("menu", "max");
  return NextResponse.json({ item: updated[0] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // FIXED: Explicitly await the params Promise to fulfill Next.js 15 requirements and prevent compilation exceptions
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.id);
  if (!Number.isInteger(parsedId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  await db.delete(menuItems).where(eq(menuItems.id, parsedId));
  revalidateTag("menu", "max");
  return NextResponse.json({ ok: true });
}
