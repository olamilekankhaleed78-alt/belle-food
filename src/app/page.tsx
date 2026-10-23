import type { Metadata } from "next";
import { Storefront } from "@/components/site/Storefront";
import { getPublicMenu } from "@/lib/menu";
import { getSiteContent } from "@/lib/site-content-store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: content.brandName, description: content.hero.subtitle };
}

export default async function HomePage() {
  const [items, content] = await Promise.all([getPublicMenu(), getSiteContent()]);

  return <Storefront items={items} content={content} />;
}
