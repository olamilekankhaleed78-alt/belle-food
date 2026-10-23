import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  canAttemptLogin,
  clearLoginAttempts,
  getRequestIp,
  registerFailedLogin,
  signAdminToken,
  validateAdminPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const ip = getRequestIp(request.headers);
  const { allowed, retryAfterMs } = canAttemptLogin(ip);

  if (!allowed) {
    return NextResponse.json(
      { message: `Too many attempts. Retry in ${Math.ceil(retryAfterMs / 1000)}s.` },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        username?: string;
        password?: string;
      }
    | null;

  const password = body?.password ?? "";
  const username = body?.username ?? "admin";

  const valid = await validateAdminPassword(password);

  if (!valid) {
    registerFailedLogin(ip);
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  clearLoginAttempts(ip);
  const token = await signAdminToken({ username });

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
