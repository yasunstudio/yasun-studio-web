"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { type ActionState, csv, optionalUrl, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

import { POSTS_TAG } from "./queries";

const PostSchema = z.object({
  title: z.string().trim().min(3, "Minimal 3 karakter").max(200),
  slug: z.string().trim().max(220).optional().transform((v) => v || undefined),
  excerpt: z.string().trim().min(10, "Minimal 10 karakter").max(300),
  content: z.string().default(""),
  cover_url: optionalUrl,
  tags: csv,
  status: z.enum(["draft", "published", "archived"]),
});

export async function savePost(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = PostSchema.parse(Object.fromEntries(formData));
    if (id) {
      await api(`/admin/posts/${id}`, { method: "PATCH", body: data, auth: true });
    } else {
      await api("/admin/posts", { method: "POST", body: data, auth: true });
    }
  } catch (error) {
    return toActionError(error);
  }
  revalidateTag(POSTS_TAG, "max");
  revalidatePath("/admin/artikel");
  redirect("/admin/artikel?saved=1");
}

export async function deletePost(id: string): Promise<ActionState> {
  try {
    await api(`/admin/posts/${id}`, { method: "DELETE", auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidateTag(POSTS_TAG, "max");
  revalidatePath("/admin/artikel");
  return { ok: true, message: "Artikel dihapus." };
}
