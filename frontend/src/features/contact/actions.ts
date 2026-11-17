"use server";

import { z } from "zod";

import { type ActionState, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.email("Email tidak valid"),
  subject: z.string().trim().min(3, "Subjek minimal 3 karakter").max(200),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter").max(5000),
});

export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = ContactSchema.parse(Object.fromEntries(formData));
    const res = await api<{ message: string }>("/contact", { method: "POST", body: data });
    return { ok: true, message: res.message };
  } catch (error) {
    return toActionError(error);
  }
}
