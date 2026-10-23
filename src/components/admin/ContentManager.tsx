"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ImageUploadButton } from "@/components/admin/ImageUploadButton";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content";

const inputClass = "w-full border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm";

function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-[0.12em] text-zinc-400">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={inputClass}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
      {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border border-[#222] p-4">
      <h3 className="font-serif-display text-2xl">{title}</h3>
      {children}
    </section>
  );
}

export function ContentManager() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data: SiteContent) => setContent(data))
      .catch(() => setStatus({ ok: false, text: "Could not load the website text." }));
  }, []);

  function update(change: (draft: SiteContent) => void) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      change(next);
      return next;
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        setStatus({ ok: true, text: "Saved. Refresh the website to see your changes." });
      } else {
        setStatus({ ok: false, text: data.message ?? "Could not save. Please try again." });
      }
    } catch {
      setStatus({ ok: false, text: "Could not save. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return <p className="text-sm text-zinc-400">{status ? status.text : "Loading website text..."}</p>;
  }

  return (
    <form className="space-y-5" onSubmit={save}>
      <p className="text-sm text-zinc-400">
        Change the words and photos on the public website here. Menu dishes and prices are edited in the Menu tab.
      </p>

      <Section title="Top of the website">
        <Field
          label="Business name"
          value={content.brandName}
          onChange={(v) => update((d) => { d.brandName = v; })}
        />
        <Field
          label="Header button text"
          value={content.headerButtonText}
          onChange={(v) => update((d) => { d.headerButtonText = v; })}
          hint="Leave empty to hide the button."
        />
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={content.demoBanner.enabled}
            onChange={(e) => update((d) => { d.demoBanner.enabled = e.target.checked; })}
          />
          Show the notice bar at the very top
        </label>
        <Field
          label="Notice bar text"
          value={content.demoBanner.text}
          onChange={(v) => update((d) => { d.demoBanner.text = v; })}
        />
      </Section>

      <Section title="Main banner (hero)">
        <Field label="Small line above the title" value={content.hero.eyebrow} onChange={(v) => update((d) => { d.hero.eyebrow = v; })} />
        <Field label="Big title" value={content.hero.title} onChange={(v) => update((d) => { d.hero.title = v; })} />
        <Field label="Sentence under the title" value={content.hero.subtitle} multiline onChange={(v) => update((d) => { d.hero.subtitle = v; })} />
        <Field label="First button" value={content.hero.primaryButton} onChange={(v) => update((d) => { d.hero.primaryButton = v; })} hint="Leave empty to hide it." />
        <Field label="Second button" value={content.hero.secondaryButton} onChange={(v) => update((d) => { d.hero.secondaryButton = v; })} hint="Leave empty to hide it." />
        <Field label="Background photo link" value={content.hero.imageUrl} onChange={(v) => update((d) => { d.hero.imageUrl = v; })} hint="Paste a photo link that starts with https://, or upload one below." />
        <ImageUploadButton onUploaded={(url) => update((d) => { d.hero.imageUrl = url; })} />
      </Section>

      <Section title="Our Story section">
        <Field label="Small line above the heading" value={content.story.eyebrow} onChange={(v) => update((d) => { d.story.eyebrow = v; })} />
        <Field label="Heading" value={content.story.heading} onChange={(v) => update((d) => { d.story.heading = v; })} />
        <Field label="Story text" value={content.story.body} multiline onChange={(v) => update((d) => { d.story.body = v; })} />
        <Field label="Link text" value={content.story.linkText} onChange={(v) => update((d) => { d.story.linkText = v; })} hint="Leave empty to hide the link." />
        <Field label="Photo link" value={content.story.imageUrl} onChange={(v) => update((d) => { d.story.imageUrl = v; })} hint="Leave empty to hide the photo." />
        <ImageUploadButton onUploaded={(url) => update((d) => { d.story.imageUrl = url; })} />
      </Section>

      <Section title="Menu section heading">
        <Field label="Small line above the heading" value={content.menuSection.eyebrow} onChange={(v) => update((d) => { d.menuSection.eyebrow = v; })} />
        <Field label="Heading" value={content.menuSection.heading} onChange={(v) => update((d) => { d.menuSection.heading = v; })} />
      </Section>

      <Section title="Three highlight cards">
        <Field label="Section heading" value={content.features.heading} onChange={(v) => update((d) => { d.features.heading = v; })} />
        {content.features.items.map((item, i) => (
          <div key={i} className="space-y-3 border border-[#222] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Card {i + 1}</p>
            <Field label="Title" value={item.title} onChange={(v) => update((d) => { d.features.items[i].title = v; })} />
            <Field label="Text" value={item.text} multiline onChange={(v) => update((d) => { d.features.items[i].text = v; })} />
          </div>
        ))}
      </Section>

      <Section title="Contact and footer">
        <Field label="Address" value={content.contact.address} onChange={(v) => update((d) => { d.contact.address = v; })} />
        <Field label="Opening hours, line 1" value={content.contact.hoursLine1} onChange={(v) => update((d) => { d.contact.hoursLine1 = v; })} />
        <Field label="Opening hours, line 2" value={content.contact.hoursLine2} onChange={(v) => update((d) => { d.contact.hoursLine2 = v; })} />
        <Field label="Instagram name" value={content.contact.instagramHandle} onChange={(v) => update((d) => { d.contact.instagramHandle = v; })} />
        <Field label="Instagram link" value={content.contact.instagramUrl} onChange={(v) => update((d) => { d.contact.instagramUrl = v; })} hint="Leave empty to hide the Instagram link." />
      </Section>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 border-t border-[#222] bg-[#111] px-1 py-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save website text"}
        </button>
        <button
          type="button"
          onClick={() => setContent(structuredClone(DEFAULT_SITE_CONTENT))}
          className="border border-[#333] px-4 py-2 text-xs uppercase tracking-[0.12em] text-zinc-300"
        >
          Restore original wording
        </button>
        {status ? (
          <p className={`text-sm ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.text}</p>
        ) : null}
      </div>
    </form>
  );
}
