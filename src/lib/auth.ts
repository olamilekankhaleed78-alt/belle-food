import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "belle_admin_token";

const MIN_SECRET_LENGTH = 32;
const MIN_PASSWORD_LENGTH = 12;

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return new TextEncoder().encode(secret);
}

/**
 * The admin area only works when a strong password AND a strong secret are set.
 * There are no built-in fallback values, so a missing setting locks the admin
 * instead of opening it to anyone who has read the code.
 */
export function isAdminConfigured(): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const password = process.env.ADMIN_PASSWORD;
  const hasPassword = Boolean(hash) || Boolean(password && password.length >= MIN_PASSWORD_LENGTH);
  return hasPassword && getJwtSecret() !== null;
}

function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function getRequestIp(headers: Headers) {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";

  return headers.get("x-real-ip") ?? "unknown";
}

export async function validateAdminPassword(password: string) {
  if (!isAdminConfigured()) return false;

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return bcrypt.compare(password, hash);
  }

  return safeEqual(password, process.env.ADMIN_PASSWORD ?? "");
}

export async function signAdminToken(payload: { username: string }) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("Admin login is not configured");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const verified = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return verified.payload as { username: string };
  } catch {
    return null;
  }
}
