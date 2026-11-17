"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { type ActionState, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";
import type { TokenPair } from "@/lib/api/types";
import { clearSession, getRefreshToken, setSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/tokens";

const LoginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  next: z.string().optional(),
});

const RegisterSchema = z
  .object({
    full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
    email: z.email("Email tidak valid"),
    password: z.string().min(8, "Minimal 8 karakter").max(128),
    password_confirm: z.string(),
    next: z.string().optional(),
  })
  .refine((d) => d.password === d.password_confirm, {
    path: ["password_confirm"],
    message: "Konfirmasi kata sandi tidak sama",
  });

/** One sign-in for everyone; the destination depends on the role. */
export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let target: string;
  try {
    const data = LoginSchema.parse(Object.fromEntries(formData));
    const tokens = await api<TokenPair>("/auth/login", {
      method: "POST",
      body: { email: data.email, password: data.password },
    });
    await setSession(tokens);
    target = safeNext(data.next, tokens.user.role);
  } catch (error) {
    return toActionError(error);
  }
  redirect(target);
}

/** Self-service learner sign-up, signs the user in immediately. */
export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let target: string;
  try {
    const data = RegisterSchema.parse(Object.fromEntries(formData));
    const tokens = await api<TokenPair>("/auth/register", {
      method: "POST",
      body: { full_name: data.full_name, email: data.email, password: data.password },
    });
    await setSession(tokens);
    target = safeNext(data.next, tokens.user.role);
  } catch (error) {
    return toActionError(error);
  }
  redirect(target);
}

export async function logout() {
  const refresh = await getRefreshToken();
  if (refresh) {
    await api("/auth/logout", { method: "POST", body: { refresh_token: refresh } }).catch(() => {});
  }
  await clearSession();
  redirect("/login");
}
