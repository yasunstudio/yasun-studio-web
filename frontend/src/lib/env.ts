import "server-only";

/** Server-side environment. Fails fast in production if misconfigured. */
export const env = {
  API_INTERNAL_URL: process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1",
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  isProd: process.env.NODE_ENV === "production",
} as const;
