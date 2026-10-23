import { createHash } from "node:crypto";
import { and, eq, like, lt } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

/**
 * Rate limiting that is stored in the database (the existing `settings` table),
 * so it keeps working across Vercel's many short-lived servers.
 */

type Entry = { count: number; windowStartedAt: number; lockedUntil: number };
type Options = { limit: number; windowMs: number; lockMs: number };

function keyFor(scope: string, id: string) {
  return `rl:${scope}:${createHash("sha256").update(id).digest("hex").slice(0, 24)}`;
}

async function readEntry(key: string): Promise<Entry | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  const value = rows[0]?.value;
  if (!value) return null;
  try {
    const entry = JSON.parse(value) as Entry;
    return typeof entry.count === "number" ? entry : null;
  } catch {
    return null;
  }
}

async function writeEntry(key: string, entry: Entry) {
  const value = JSON.stringify(entry);
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

async function cleanupOldEntries() {
  if (Math.random() > 0.05) return;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.delete(settings).where(and(like(settings.key, "rl:%"), lt(settings.updatedAt, cutoff)));
}

/** True while this visitor is locked out. */
export async function isBlocked(scope: string, id: string): Promise<boolean> {
  try {
    const entry = await readEntry(keyFor(scope, id));
    return Boolean(entry && entry.lockedUntil > Date.now());
  } catch {
    return false;
  }
}

/** Counts one attempt. Returns blocked = true once the visitor goes over the limit. */
export async function hit(scope: string, id: string, options: Options): Promise<{ blocked: boolean }> {
  try {
    const key = keyFor(scope, id);
    const now = Date.now();
    const existing = await readEntry(key);

    if (existing && existing.lockedUntil > now) return { blocked: true };

    const fresh = !existing || now - existing.windowStartedAt > options.windowMs;
    const entry: Entry = fresh
      ? { count: 1, windowStartedAt: now, lockedUntil: 0 }
      : { ...existing, count: existing.count + 1 };

    const blocked = entry.count > options.limit;
    if (blocked) entry.lockedUntil = now + options.lockMs;

    await writeEntry(key, entry);
    await cleanupOldEntries();
    return { blocked };
  } catch {
    // If the limiter itself fails, don't stop real customers from ordering.
    return { blocked: false };
  }
}

export async function reset(scope: string, id: string) {
  try {
    await db.delete(settings).where(eq(settings.key, keyFor(scope, id)));
  } catch {
    // Nothing to clean up.
  }
}
