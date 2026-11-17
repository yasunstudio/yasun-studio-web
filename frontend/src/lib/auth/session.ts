import "server-only";

import { cookies } from "next/headers";

import type { TokenPair, UserRole } from "@/lib/api/types";

/**
 * Session = two httpOnly cookies holding the backend's JWTs.
 * Tokens never reach client JS; Server Components / Actions attach them
 * to backend calls, and `src/proxy.ts` refreshes them transparently.
 */
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_MAX_AGE, baseCookie, decodeJwt } from "./tokens";

export { ACCESS_COOKIE, REFRESH_COOKIE };

export type SessionUser = { id: string; name: string; role: UserRole };

export async function setSession(tokens: Pick<TokenPair, "access_token" | "refresh_token" | "expires_in">) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.access_token, { ...baseCookie, maxAge: tokens.expires_in });
  jar.set(REFRESH_COOKIE, tokens.refresh_token, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

/** Reads (unverified) claims for UI purposes only. Authorization is enforced by the API. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getAccessToken();
  const claims = token ? decodeJwt(token) : null;
  if (!claims) return null;
  return { id: String(claims.sub), name: String(claims.name ?? ""), role: claims.role as UserRole };
}
