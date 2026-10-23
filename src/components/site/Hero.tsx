"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section id="home" ref={ref} className="relative min-h-[92vh] overflow-hidden border-b border-[#222]">
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#111111]" />

      <div className="section-shell relative z-10 flex min-h-[92vh] items-center justify-center text-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#d4af37]">Welcome to</p>
          <h1 className="font-serif-display text-[clamp(3rem,12vw,7.5rem)] leading-[0.95] text-white"># Belle Food</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-300 md:text-lg">
            A premium traditional Nigerian Dining Experience in Lagos. Open 24/7.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-black"
            >
              Book a Table
            </a>
            <a
              href="#menu"
              className="border border-white/70 px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white"
            >
              Order & Pickup
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
