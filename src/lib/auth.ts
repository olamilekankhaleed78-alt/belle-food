import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "belle_admin_token";

const ATTEMPT_LIMIT = 7;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 20 * 60 * 1000;

const loginAttempts = new Map<
  string,
  {
    count: number;
    windowStartedAt: number;
    lockedUntil: number;
  }
>();

function getJwtSecret() {
  return new TextEncoder().encode(process.env.ADMIN_JWT_SECRET ?? "dev-only-change-me");
}

function getConfiguredPassword() {
  return process.env.ADMIN_PASSWORD ?? "kingmitchy-24-7";
}

function getConfiguredPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH;
}

export function getRequestIp(headers: Headers) {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";

  return headers.get("x-real-ip") ?? "unknown";
}

export function canAttemptLogin(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip);

  if (!current) {
    return { allowed: true, retryAfterMs: 0 };
  }

  if (current.lockedUntil > now) {
    return { allowed: false, retryAfterMs: current.lockedUntil - now };
  }

  if (now - current.windowStartedAt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 0, windowStartedAt: now, lockedUntil: 0 });
  }

  return { allowed: true, retryAfterMs: 0 };
}

export async function validateAdminPassword(password: string) {
  const hash = getConfiguredPasswordHash();

  if (hash) {
    return bcrypt.compare(password, hash);
  }

  return password === getConfiguredPassword();
}

export function registerFailedLogin(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.windowStartedAt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStartedAt: now, lockedUntil: 0 });
    return;
  }

  entry.count += 1;

  if (entry.count >= ATTEMPT_LIMIT) {
    entry.lockedUntil = now + LOCK_MS;
  }

  loginAttempts.set(ip, entry);
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function signAdminToken(payload: { username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as { username: string };
  } catch {
    return null;
  }
}
