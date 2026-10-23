import { Storefront } from "@/components/site/Storefront";
import { getPublicMenu } from "@/lib/menu";

export const revalidate = 60;

export default async function HomePage() {
  const items = await getPublicMenu();

  return <Storefront items={items} />;
}
