/** Edge/Node-safe token helpers shared by session.ts and proxy.ts. */

export const ACCESS_COOKIE = "ys_access";
export const REFRESH_COOKIE = "ys_refresh";
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  // Set COOKIE_INSECURE=true only when serving production over plain HTTP (e.g. local prod test).
  secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "true",
  path: "/",
};

export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** True if the token is missing, malformed, or expires within `skewSeconds`. */
export function isExpired(token: string | undefined, skewSeconds = 30): boolean {
  if (!token) return true;
  const exp = decodeJwt(token)?.exp;
  return typeof exp !== "number" || exp * 1000 - skewSeconds * 1000 < Date.now();
}

export type Role = "admin" | "editor" | "member";

export function roleOf(token: string | undefined): Role | null {
  const role = token ? decodeJwt(token)?.role : null;
  return role === "admin" || role === "editor" || role === "member" ? role : null;
}

export const isStaff = (role: Role | null) => role === "admin" || role === "editor";

/** Where a user lands after login when no (valid) `next` is given. */
export const homeFor = (role: Role | null) => (isStaff(role) ? "/admin" : "/belajar");

/**
 * Validates a post-login redirect target: internal paths only (no open
 * redirects), and members can never be sent into /admin.
 */
export function safeNext(next: string | undefined | null, role: Role | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return homeFor(role);
  if (next.startsWith("/admin") && !isStaff(role)) return "/belajar";
  return next;
}
