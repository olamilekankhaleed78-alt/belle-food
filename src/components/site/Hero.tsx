"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SiteContent } from "@/lib/site-content";

export function Hero({ content }: { content: SiteContent["hero"] }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section id="home" ref={ref} className="relative min-h-[92vh] overflow-hidden border-b border-[#222]">
      <motion.div
        style={{ y, backgroundImage: content.imageUrl ? `url(${JSON.stringify(content.imageUrl)})` : undefined }}
        className="absolute inset-0 bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#111111]" />

      <div className="section-shell relative z-10 flex min-h-[92vh] items-center justify-center text-center">
        <div className="max-w-3xl">
          {content.eyebrow ? (
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#d4af37]">{content.eyebrow}</p>
          ) : null}
          <h1 className="font-serif-display text-[clamp(3rem,12vw,7.5rem)] leading-[0.95] text-white">{content.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-300 md:text-lg">
            {content.subtitle}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {content.primaryButton ? (
              <a
                href="#contact"
                className="bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-black"
              >
                {content.primaryButton}
              </a>
            ) : null}
            {content.secondaryButton ? (
              <a
                href="#menu"
                className="border border-white/70 px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white"
              >
                {content.secondaryButton}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
