import "server-only";

import { z } from "zod";

import { ApiError } from "@/lib/api/client";

export type ActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

/** Normalises zod / API / unknown errors into a form-friendly ActionState. */
export function toActionError(error: unknown): ActionState {
  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Periksa kembali isian Anda.", fieldErrors };
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return { ok: false, message: "Sesi berakhir, silakan login kembali." };
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  console.error(error);
  return { ok: false, message: "Terjadi kesalahan. Coba lagi beberapa saat." };
}

export const csv = z
  .string()
  .optional()
  .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []));

/** Unchecked checkboxes/switches send nothing at all, so the key must be optional. */
export const checkbox = z
  .enum(["on", "true", "false"])
  .nullish()
  .transform((v) => v === "on" || v === "true");

export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null)
  .pipe(z.url("URL tidak valid").nullable());
