import "server-only";

import { headers as requestHeaders } from "next/headers";

import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Field-level errors from FastAPI validation → { field: message } */
  get fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    return Object.fromEntries(
      (this.details as { field: string; message: string }[]).map((d) => [d.field, d.message]),
    );
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Attach the session's access token (admin calls). */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** ISR: seconds to cache public GETs (default 60). Ignored for auth calls. */
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Typed server-side fetch to the FastAPI backend (internal Docker network).
 * Public GETs are cached via Next's data cache + tags; auth calls are never cached.
 */
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, auth, query, revalidate = 60, tags, headers, ...init } = opts;

  const url = new URL(env.API_INTERNAL_URL + path);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  const method = (init.method ?? "GET").toUpperCase();
  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (body !== undefined) h.set("Content-Type", "application/json");
  // Forward the visitor's IP (set by nginx) so backend rate limits are per visitor.
  if (method !== "GET") {
    const ip = await clientIp();
    if (ip) h.set("X-Real-IP", ip);
  }
  if (auth) {
    const token = await getAccessToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const cacheable = method === "GET" && !auth && revalidate !== false;

  const res = await fetch(url, {
    ...init,
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(cacheable ? { next: { revalidate, tags } } : { cache: "no-store" as const }),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    throw new ApiError(res.status, err?.code ?? "unknown", err?.message ?? res.statusText, err?.details);
  }
  return data as T;
}

async function clientIp(): Promise<string | null> {
  try {
    return (await requestHeaders()).get("x-real-ip");
  } catch {
    return null; // outside a request scope (e.g. build time)
  }
}

/** Graceful degradation for non-critical public sections (e.g. home page widgets). */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error("[api] falling back:", error instanceof Error ? error.message : error);
    return fallback;
  }
}

export const emptyPage = { items: [], total: 0, page: 1, size: 0, pages: 0 };
