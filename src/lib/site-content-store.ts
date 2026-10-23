import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { DEFAULT_SITE_CONTENT, mergeContent, type SiteContent } from "@/lib/site-content";

export const SITE_CONTENT_KEY = "siteContent";

/** Reads the saved website wording straight from the database (used by the admin). */
export async function readSiteContent(): Promise<SiteContent> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, SITE_CONTENT_KEY))
      .limit(1);
    const value = rows[0]?.value;
    return value ? mergeContent(JSON.parse(value)) : DEFAULT_SITE_CONTENT;
  } catch {
    // Never break the public website because of a content problem.
    return DEFAULT_SITE_CONTENT;
  }
}

/** Cached copy for the public website. The admin clears it when you save. */
export const getSiteContent = unstable_cache(readSiteContent, ["site-content"], {
  revalidate: 60,
  tags: ["content"],
});
