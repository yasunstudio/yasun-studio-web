"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type ActionState, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

const CreateUserSchema = z.object({
  full_name: z.string().trim().min(2, "Minimal 2 karakter").max(120),
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
  role: z.enum(["admin", "editor", "member"]),
});

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = CreateUserSchema.parse(Object.fromEntries(formData));
    await api("/admin/users", { method: "POST", body: data, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/admin/pengguna");
  return { ok: true, message: "Pengguna berhasil dibuat." };
}

export async function toggleUserActive(id: string, isActive: boolean): Promise<ActionState> {
  try {
    await api(`/admin/users/${id}`, { method: "PATCH", body: { is_active: isActive }, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/admin/pengguna");
  return { ok: true };
}

export async function deleteUser(id: string): Promise<ActionState> {
  try {
    await api(`/admin/users/${id}`, { method: "DELETE", auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/admin/pengguna");
  return { ok: true, message: "Pengguna dihapus." };
}
