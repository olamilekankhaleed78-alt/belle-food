import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { assertAdminApiSession } from "@/lib/admin-session";
import { siteContentSchema } from "@/lib/site-content";
import { SITE_CONTENT_KEY, readSiteContent } from "@/lib/site-content-store";

export async function GET() {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await readSiteContent());
}

export async function PUT(request: Request) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = siteContentSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue ? issue.path.join(" > ") : "";
    return NextResponse.json(
      { message: issue ? `${where}: ${issue.message}` : "Invalid content" },
      { status: 400 },
    );
  }

  const value = JSON.stringify(parsed.data);

  await db
    .insert(settings)
    .values({ key: SITE_CONTENT_KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });

  revalidateTag("content", "max");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
