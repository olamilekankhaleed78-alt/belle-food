import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import type { SiteContent } from "@/lib/site-content";

export function Story({ content }: { content: SiteContent["story"] }) {
  return (
    <section id="story" className="bg-white py-20 text-zinc-900 md:py-28">
      <div
        className={`section-shell grid items-center gap-10 ${content.imageUrl ? "md:grid-cols-2" : ""}`}
      >
        {content.imageUrl ? (
          <Reveal>
            <div className="relative min-h-[420px] overflow-hidden border border-zinc-200">
              <Image src={content.imageUrl} alt={content.heading || "Our story"} fill className="object-cover" />
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.15}>
          {content.eyebrow ? (
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-zinc-500">{content.eyebrow}</p>
          ) : null}
          <h2 className="font-serif-display text-4xl leading-tight text-zinc-950 md:text-5xl">
            {content.heading}
          </h2>
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-zinc-700">{content.body}</p>
          {content.linkText ? (
            <a href="#menu" className="mt-8 inline-block text-sm uppercase tracking-[0.12em] text-zinc-900 underline">
              {content.linkText}
            </a>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
