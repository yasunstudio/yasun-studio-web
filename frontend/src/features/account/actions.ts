"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type ActionState, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

const ProfileSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
});

const PasswordSchema = z
  .object({
    current_password: z.string().min(1, "Wajib diisi"),
    new_password: z.string().min(8, "Minimal 8 karakter").max(128),
    new_password_confirm: z.string(),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    path: ["new_password_confirm"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = ProfileSchema.parse(Object.fromEntries(formData));
    await api("/users/me", { method: "PATCH", body: data, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/akun");
  // Name in the header comes from the access token; it refreshes on the next token rotation.
  return { ok: true, message: "Profil diperbarui." };
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = PasswordSchema.parse(Object.fromEntries(formData));
    await api("/users/me/password", {
      method: "POST",
      body: { current_password: data.current_password, new_password: data.new_password },
      auth: true,
    });
  } catch (error) {
    const state = toActionError(error);
    // 401 here means "wrong current password", not an expired session.
    if (state.message?.startsWith("Sesi berakhir")) {
      return { ok: false, fieldErrors: { current_password: "Kata sandi saat ini salah" } };
    }
    return state;
  }
  return { ok: true, message: "Kata sandi berhasil diganti." };
}
