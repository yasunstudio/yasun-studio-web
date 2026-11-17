"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { type ActionState, checkbox, csv, optionalUrl, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

import { COURSES_TAG } from "./queries";

const CourseSchema = z.object({
  title: z.string().trim().min(3, "Minimal 3 karakter").max(200),
  slug: z.string().trim().max(220).optional().transform((v) => v || undefined),
  summary: z.string().trim().min(10, "Minimal 10 karakter").max(300),
  description: z.string().default(""),
  category: z.string().trim().min(2, "Wajib diisi").max(60),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  tags: csv,
  thumbnail_url: optionalUrl,
  price: z.coerce.number().int().min(0),
  is_featured: checkbox,
  is_published: checkbox,
});

export async function saveCourse(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = CourseSchema.parse(Object.fromEntries(formData));
    if (id) {
      await api(`/admin/courses/${id}`, { method: "PATCH", body: data, auth: true });
    } else {
      await api("/admin/courses", { method: "POST", body: data, auth: true });
    }
  } catch (error) {
    return toActionError(error);
  }
  revalidateTag(COURSES_TAG, "max");
  revalidatePath("/admin/kelas");
  redirect("/admin/kelas?saved=1");
}

export async function deleteCourse(id: string): Promise<ActionState> {
  try {
    await api(`/admin/courses/${id}`, { method: "DELETE", auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidateTag(COURSES_TAG, "max");
  revalidatePath("/admin/kelas");
  return { ok: true, message: "Kelas dihapus." };
}
