"use server";

import { revalidatePath } from "next/cache";

import { type ActionState, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

export async function setMessageRead(id: string, isRead: boolean): Promise<ActionState> {
  try {
    await api(`/admin/messages/${id}`, { method: "PATCH", body: { is_read: isRead }, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionState> {
  try {
    await api(`/admin/messages/${id}`, { method: "DELETE", auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Pesan dihapus." };
}
