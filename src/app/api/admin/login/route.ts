import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getRequestIp,
  isAdminConfigured,
  signAdminToken,
  validateAdminPassword,
} from "@/lib/auth";
import { hit, isBlocked, reset } from "@/lib/rate-limit";

const LOGIN_LIMIT = { limit: 6, windowMs: 10 * 60 * 1000, lockMs: 30 * 60 * 1000 };

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { message: "Admin login is not set up yet. Add ADMIN_PASSWORD and ADMIN_JWT_SECRET in Vercel." },
      { status: 503 },
    );
  }

  const ip = getRequestIp(request.headers);

  if (await isBlocked("login", ip)) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again in about 30 minutes." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  const valid = await validateAdminPassword(password);

  if (!valid) {
    await hit("login", ip, LOGIN_LIMIT);
    // A short pause makes guessing passwords much slower.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  await reset("login", ip);
  const token = await signAdminToken({ username: "admin" });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
