import { CalendarDays, HandPlatter, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import type { SiteContent } from "@/lib/site-content";

const icons = [Sparkles, HandPlatter, CalendarDays];

export function Testimonials({ content }: { content: SiteContent["features"] }) {
  return (
    <section className="py-20 md:py-24">
      <div className="section-shell">
        <Reveal>
          <h2 className="font-serif-display text-4xl text-white md:text-5xl">{content.heading}</h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {content.items.map((feature, idx) => {
            const Icon = icons[idx] ?? Sparkles;
            return (
              <Reveal key={idx} delay={idx * 0.08}>
                <div className="h-full border border-[#222] p-6">
                  <Icon className="text-[#d4af37]" size={22} />
                  <h3 className="mt-4 font-serif-display text-2xl text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">{feature.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
