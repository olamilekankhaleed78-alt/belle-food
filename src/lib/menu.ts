import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { seedMenuIfEmpty } from "@/db/seed-data";

const loadMenu = unstable_cache(
  async () => {
    await seedMenuIfEmpty();

    return db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(asc(menuItems.id));
  },
  ["public-menu-cache"],
  { revalidate: 60, tags: ["menu"] },
);

export async function getPublicMenu() {
  return loadMenu();
}
