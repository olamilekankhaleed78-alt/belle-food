import { z } from "zod";

const text = (max: number) => z.string().max(max);

/** A link or image address: empty, a site path, or a full https:// link. */
const link = z
  .string()
  .max(600)
  .refine(
    (value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value),
    "Use a full link that starts with https://",
  );

export const siteContentSchema = z.object({
  brandName: text(60),
  headerButtonText: text(40),
  demoBanner: z.object({ enabled: z.boolean(), text: text(200) }),
  hero: z.object({
    eyebrow: text(60),
    title: text(80),
    subtitle: text(300),
    primaryButton: text(40),
    secondaryButton: text(40),
    imageUrl: link,
  }),
  story: z.object({
    eyebrow: text(60),
    heading: text(120),
    body: text(1200),
    linkText: text(60),
    imageUrl: link,
  }),
  menuSection: z.object({ eyebrow: text(60), heading: text(120) }),
  features: z.object({
    heading: text(80),
    items: z.array(z.object({ title: text(60), text: text(240) })).length(3),
  }),
  contact: z.object({
    address: text(200),
    hoursLine1: text(80),
    hoursLine2: text(80),
    instagramHandle: text(60),
    instagramUrl: link,
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brandName: "Belle Food",
  headerButtonText: "Book a Table",
  demoBanner: {
    enabled: true,
    text: "Concept preview: not the official BelleFood website",
  },
  hero: {
    eyebrow: "Welcome to",
    title: "Belle Food",
    subtitle: "A premium traditional Nigerian dining experience in Lagos. Open 24/7.",
    primaryButton: "Book a Table",
    secondaryButton: "Order & Pickup",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=80",
  },
  story: {
    eyebrow: "Our Story",
    heading: "Discover Authentic Nigerian Cuisine",
    body: "In the heart of Lekki, Belle Food serves a refined 24/7 culinary journey where traditional Nigerian flavors are elevated with craftsmanship, premium hospitality, and community warmth. Every platter celebrates heritage, artistry, and togetherness.",
    linkText: "Explore Signature Pots",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  },
  menuSection: {
    eyebrow: "Culinary Highlights",
    heading: "Signature Menu Showcase",
  },
  features: {
    heading: "Why Belle Food",
    items: [
      {
        title: "Ready to Serve You",
        text: "Luxury hospitality, plated with speed and consistency around the clock.",
      },
      {
        title: "Togetherness",
        text: "Communal platter heritage designed to unite family, friends, and celebrations.",
      },
      {
        title: "Special Events",
        text: "A polished private venue solution for birthdays, launches, and executive gatherings.",
      },
    ],
  },
  contact: {
    address: "Opposite Abiola Court 10, Chevron Alternative Route, Lekki, Lagos",
    hoursLine1: "Open 24 Hours",
    hoursLine2: "7 Days a Week",
    instagramHandle: "@bellefoodlagos_",
    instagramUrl: "https://instagram.com/bellefoodlagos_",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Keeps saved values that have the right type, and falls back to defaults for the rest. */
function pickValues<T extends Record<string, string | boolean>>(defaults: T, raw: unknown): T {
  if (!isRecord(raw)) return defaults;
  const out: Record<string, string | boolean> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = raw[key];
    if (typeof value === typeof defaults[key]) out[key] = value as string | boolean;
  }
  return out as T;
}

export function mergeContent(raw: unknown): SiteContent {
  const d = DEFAULT_SITE_CONTENT;
  if (!isRecord(raw)) return d;

  const rawFeatures = isRecord(raw.features) ? raw.features : {};
  const rawItems: unknown[] = Array.isArray(rawFeatures.items) ? rawFeatures.items : [];

  return {
    brandName: typeof raw.brandName === "string" ? raw.brandName : d.brandName,
    headerButtonText:
      typeof raw.headerButtonText === "string" ? raw.headerButtonText : d.headerButtonText,
    demoBanner: pickValues(d.demoBanner, raw.demoBanner),
    hero: pickValues(d.hero, raw.hero),
    story: pickValues(d.story, raw.story),
    menuSection: pickValues(d.menuSection, raw.menuSection),
    features: {
      heading: typeof rawFeatures.heading === "string" ? rawFeatures.heading : d.features.heading,
      items: d.features.items.map((item, i) => pickValues(item, rawItems[i])),
    },
    contact: pickValues(d.contact, raw.contact),
  };
}
