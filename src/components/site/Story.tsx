import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";

export function Story() {
  return (
    <section id="story" className="bg-white py-20 text-zinc-900 md:py-28">
      <div className="section-shell grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <div className="relative min-h-[420px] overflow-hidden border border-zinc-200">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury Belle Food dining interior"
              fill
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-zinc-500">Our Story</p>
          <h2 className="font-serif-display text-4xl leading-tight text-zinc-950 md:text-5xl">
            # Discover Authentic Nigerian Cuisine
          </h2>
          <p className="mt-6 text-base leading-8 text-zinc-700">
            In the heart of Lekki, Belle Food by King Mitchy serves a refined 24/7 culinary journey where
            traditional Nigerian flavors are elevated with craftsmanship, premium hospitality, and community
            warmth. Every platter celebrates heritage, artistry, and togetherness.
          </p>
          <a href="#menu" className="mt-8 inline-block text-sm uppercase tracking-[0.12em] text-zinc-900 underline">
            Explore Signature Pots
          </a>
        </Reveal>
      </div>
    </section>
  );
}
