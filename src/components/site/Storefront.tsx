"use client";

import { CartDrawer } from "@/components/site/CartDrawer";
import { CartProvider } from "@/components/site/CartContext";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { MenuShowcase } from "@/components/site/MenuShowcase";
import { Story } from "@/components/site/Story";
import { Testimonials } from "@/components/site/Testimonials";
import type { SiteContent } from "@/lib/site-content";
import type { StoreMenuItem } from "@/lib/types";

export function Storefront({ items, content }: { items: StoreMenuItem[]; content: SiteContent }) {
  return (
    <CartProvider>
      {content.demoBanner.enabled && content.demoBanner.text ? (
        <div className="bg-[#d4af37] px-4 py-2 text-center text-xs font-semibold text-black">
          {content.demoBanner.text}
        </div>
      ) : null}
      <Header brandName={content.brandName} buttonText={content.headerButtonText} />
      <Hero content={content.hero} />
      <Story content={content.story} />
      <MenuShowcase items={items} content={content.menuSection} />
      <Testimonials content={content.features} />
      <Footer content={content} />
      <CartDrawer />
    </CartProvider>
  );
}
