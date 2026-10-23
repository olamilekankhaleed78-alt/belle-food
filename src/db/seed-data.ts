import { count } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";

const starterMenu = [
  {
    slug: "native-set-for-2",
    title: "NATIVE SET (FOR 2)",
    description:
      "A lavish spread of premium native swallows served with a choice of rich, authentic soups (Eforiro, Egusi, or Fisherman Soup). Plated with an abundance of assorted proteins including goat meat, snails, smoked fish, and kpomo.",
    priceKobo: 2500000, // ₦25,000 represented cleanly as kobo integer format
    imagePath: "/images/dish-placeholder.svg",
    isSpicy: true,
    isVegan: false,
    isAvailable: true,
  },
  {
    slug: "fisherman-set-for-2",
    title: "FISHERMAN SET (FOR 2)",
    description:
      "An upscale celebration of coastal heritage. Fresh, catch-of-the-day jumbo prawns, crab claws, calamari, and whole croaker fish slow-simmered in a highly seasoned, aromatic native broth. Served alongside premium plantain and yam wedges.",
    priceKobo: 2900000, // ₦29,000
    imagePath: "/images/dish-placeholder.svg",
    isSpicy: true,
    isVegan: false,
    isAvailable: true,
  },
  {
    slug: "signature-combo-for-2",
    title: "SIGNATURE COMBO (FOR 2)",
    description:
      "Belle Food's legendary party style smokey Jollof Rice paired with rich Native Fried Rice. Accompanied by gourmet grilled turkey, spicy peppered gizzard, sweet dodo, and crisp artisan garden salads.",
    priceKobo: 2750000, // ₦27,500
    imagePath: "/images/dish-placeholder.svg",
    isSpicy: false,
    isVegan: false,
    isAvailable: true,
  },
];

export async function seedMenuIfEmpty() {
  const [{ value }] = await db.select({ value: count() }).from(menuItems);
  if (value === 0) {
    await db.insert(menuItems).values(starterMenu);
  }
}

export { starterMenu };
