import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  baseCookie,
  homeFor,
  isExpired,
  isStaff,
  roleOf,
  safeNext,
} from "@/lib/auth/tokens";

/**
 * Next.js 16 Proxy (formerly middleware):
 *   1. Route guards
 *        /admin/*            → staff only (admin, editor); members go to /belajar
 *        /belajar/*, /akun/* → any signed-in user
 *        /login, /daftar     → signed-in users are sent to their home
 *   2. Silently rotates an expired access token using the refresh token,
 *      so Server Components always see a fresh session.
 *
 * This is UX only — the API enforces every permission independently.
 */
const AUTH_PAGES = ["/login", "/daftar"];
const PROTECTED = ["/admin", "/belajar", "/akun"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let rotated: { access_token: string; refresh_token: string; expires_in: number } | null = null;

  if (isExpired(access) && refresh) {
    rotated = await refreshTokens(refresh, request.headers.get("x-real-ip"));
    if (rotated) {
      access = rotated.access_token;
      // Forward fresh cookies to this request so Server Components see them.
      request.cookies.set(ACCESS_COOKIE, rotated.access_token);
      request.cookies.set(REFRESH_COOKIE, rotated.refresh_token);
    }
  }

  const signedIn = !isExpired(access);
  const role = signedIn ? roleOf(access) : null;

  let res: NextResponse;
  if (AUTH_PAGES.includes(pathname) && signedIn) {
    res = NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next"), role), request.url));
  } else if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    res = NextResponse.redirect(login);
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  } else if (pathname.startsWith("/admin") && !isStaff(role)) {
    res = NextResponse.redirect(new URL(homeFor(role), request.url));
  } else {
    res = NextResponse.next({ request });
  }

  if (rotated) {
    res.cookies.set(ACCESS_COOKIE, rotated.access_token, { ...baseCookie, maxAge: rotated.expires_in });
    res.cookies.set(REFRESH_COOKIE, rotated.refresh_token, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
  }
  return res;
}

async function refreshTokens(refreshToken: string, clientIp: string | null) {
  try {
    const base = process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1";
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(clientIp ? { "X-Real-IP": clientIp } : {}) },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  } catch {
    return null;
  }
}

export const config = {
  // Runs on every page (not static assets / API) so the session is refreshed
  // before any Server Component reads it — including public pages that show
  // a signed-in header.
  matcher: ["/((?!api|_next/static|_next/image|healthz|icon.svg|brand/|robots.txt|sitemap.xml).*)"],
};
