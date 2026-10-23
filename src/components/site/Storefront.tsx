"use client";

import { CartDrawer } from "@/components/site/CartDrawer";
import { CartProvider } from "@/components/site/CartContext";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { MenuShowcase } from "@/components/site/MenuShowcase";
import { Story } from "@/components/site/Story";
import { Testimonials } from "@/components/site/Testimonials";
import type { StoreMenuItem } from "@/lib/types";

export function Storefront({ items }: { items: StoreMenuItem[] }) {
  return (
    <CartProvider>
      <Header />
      <Hero />
      <Story />
      <MenuShowcase items={items} />
      <Testimonials />
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
