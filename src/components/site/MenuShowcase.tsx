"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/site/Reveal";
import { useCart } from "@/components/site/CartContext";
import { SignaturePots } from "@/components/site/SignaturePots";
import { formatNairaFromKobo } from "@/lib/currency";
import type { StoreMenuItem } from "@/lib/types";

export function MenuShowcase({ items }: { items: StoreMenuItem[] }) {
  const { addItem } = useCart();

  return (
    <section id="menu" className="border-y border-[#222] py-20 md:py-24">
      <div className="section-shell">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Culinary Highlights</p>
          <h2 className="mt-4 font-serif-display text-4xl leading-tight text-white md:text-5xl">
            Signature Menu Showcase
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.08}>
              <article className="group overflow-hidden border border-[#222] bg-[#151515]">
                <div className="relative h-64 overflow-hidden">
                  <SignaturePots spicy={item.isSpicy} vegan={item.isVegan} />
                  <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }} className="h-full w-full">
                    <Image src={item.imagePath} alt={item.title} fill className="object-cover" />
                  </motion.div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif-display text-xl text-white">{item.title}</h3>
                    <p className="text-sm text-[#d4af37]">{formatNairaFromKobo(item.priceKobo)}</p>
                  </div>
                  <p className="text-sm leading-7 text-zinc-400">{item.description}</p>
                  <button
                    type="button"
                    onClick={() => addItem(item)}
                    className="w-full border border-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
