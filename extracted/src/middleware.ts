import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "noor_admin";

/**
 * Edge gate for /admin/* — runs BEFORE any page rendering, so no admin
 * RSC payload ever streams to unauthenticated clients.
 * Pages/actions still re-verify server-side (defense in depth).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const DEFAULT_SESSION_SECRET = "noor-islamic-app-production-secret-session-key-2026-v1-fixed-auth";
  const secret = (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32)
    ? process.env.SESSION_SECRET
    : DEFAULT_SESSION_SECRET;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      if (payload.adminId && payload.email) return NextResponse.next();
    } catch {
      /* invalid/expired token → fall through to redirect */
    }
  }

  const login = new URL("/admin/login", req.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
