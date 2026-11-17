"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { COURSES_TAG } from "@/features/courses/queries";
import { type ActionState, checkbox, optionalUrl, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";

function refresh(courseId: string) {
  revalidateTag(COURSES_TAG, "max");
  revalidatePath(`/admin/kelas/${courseId}/kurikulum`);
}

const ModuleSchema = z.object({ title: z.string().trim().min(2, "Minimal 2 karakter").max(200) });

export async function addModule(courseId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = ModuleSchema.parse(Object.fromEntries(formData));
    await api(`/admin/courses/${courseId}/modules`, { method: "POST", body: data, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  refresh(courseId);
  return { ok: true, message: "Bab ditambahkan." };
}

export async function renameModule(courseId: string, moduleId: string, title: string): Promise<ActionState> {
  try {
    const data = ModuleSchema.parse({ title });
    await api(`/admin/modules/${moduleId}`, { method: "PATCH", body: data, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  refresh(courseId);
  return { ok: true };
}

export async function deleteModule(courseId: string, moduleId: string): Promise<ActionState> {
  try {
    await api(`/admin/modules/${moduleId}`, { method: "DELETE", auth: true });
  } catch (error) {
    return toActionError(error);
  }
  refresh(courseId);
  return { ok: true, message: "Bab dan seluruh materinya dihapus." };
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<ActionState> {
  try {
    await api(`/admin/lessons/${lessonId}`, { method: "DELETE", auth: true });
  } catch (error) {
    return toActionError(error);
  }
  refresh(courseId);
  return { ok: true, message: "Materi dihapus." };
}

export async function reorderCurriculum(
  courseId: string,
  order: { id: string; lesson_ids: string[] }[],
): Promise<ActionState> {
  try {
    await api(`/admin/courses/${courseId}/curriculum/order`, {
      method: "PUT",
      body: { modules: order },
      auth: true,
    });
  } catch (error) {
    return toActionError(error);
  }
  refresh(courseId);
  return { ok: true };
}

const lines = (v: unknown) =>
  String(v ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const ResourceLine = z
  .string()
  .transform((line) => line.split("|").map((p) => p.trim()))
  .pipe(
    z
      .tuple([z.string().min(2, "Judul sumber terlalu pendek"), z.url("URL sumber tidak valid")])
      .rest(z.string())
      .transform(([title, url, kind]) => ({
        title,
        url,
        kind: (["docs", "article", "video", "download", "tool"].includes(kind ?? "") ? kind : "docs") as string,
      })),
  );

const QuizQuestion = z.object({
  id: z.string(),
  prompt: z.string().trim().min(3, "Setiap soal wajib memiliki pertanyaan"),
  multiple: z.boolean(),
  options: z.array(z.object({ id: z.string(), text: z.string().trim().min(1, "Opsi jawaban tidak boleh kosong") })).min(2),
  answer: z.array(z.string()).min(1, "Tandai minimal satu jawaban benar"),
  explanation: z.string().default(""),
});

const LessonSchema = z
  .object({
    title: z.string().trim().min(2, "Minimal 2 karakter").max(200),
    slug: z.string().trim().max(220).optional().transform((v) => v || undefined),
    kind: z.enum(["video", "article", "quiz", "exercise"]),
    summary: z.string().trim().max(300).default(""),
    content: z.string().default(""),
    video_url: optionalUrl,
    duration_minutes: z.coerce.number().int().min(0),
    is_preview: checkbox,
    objectives: z.preprocess(lines, z.array(z.string().max(200, "Maks. 200 karakter per tujuan")).max(8, "Maks. 8 tujuan")),
    resources: z.preprocess(lines, z.array(ResourceLine).max(10, "Maks. 10 sumber")),
    quiz: z
      .string()
      .optional()
      .transform((v) => (v ? JSON.parse(v) : undefined))
      .pipe(z.object({ pass_score: z.number().int().min(0).max(100), questions: z.array(QuizQuestion).min(1) }).optional()),
    ex_language: z.enum(["python", "javascript"]).optional(),
    ex_instructions: z.string().optional(),
    ex_starter: z.string().optional(),
    ex_solution: z.string().optional(),
    ex_expected: z.string().optional(),
    ex_hints: z.preprocess(lines, z.array(z.string()).max(5, "Maks. 5 petunjuk")),
  })
  .superRefine((d, ctx) => {
    if (d.kind === "quiz" && !d.quiz) ctx.addIssue({ code: "custom", path: ["quiz"], message: "Tambahkan minimal satu soal" });
    if (d.kind === "exercise") {
      if (!d.ex_instructions?.trim()) ctx.addIssue({ code: "custom", path: ["exercise.instructions"], message: "Wajib diisi" });
      if (!d.ex_solution?.trim()) ctx.addIssue({ code: "custom", path: ["exercise.solution"], message: "Wajib diisi" });
      if (!d.ex_expected?.trim()) ctx.addIssue({ code: "custom", path: ["exercise.expected_output"], message: "Wajib diisi" });
    }
  })
  .transform(({ ex_language, ex_instructions, ex_starter, ex_solution, ex_expected, ex_hints, quiz, ...rest }) => ({
    ...rest,
    video_url: rest.kind === "video" ? rest.video_url : null,
    quiz: rest.kind === "quiz" ? quiz : null,
    exercise:
      rest.kind === "exercise"
        ? {
            language: ex_language ?? "python",
            instructions: ex_instructions ?? "",
            starter_code: ex_starter ?? "",
            solution: ex_solution ?? "",
            expected_output: ex_expected ?? "",
            hints: ex_hints,
          }
        : null,
  }));

export async function saveLesson(
  courseId: string,
  target: { moduleId: string } | { lessonId: string },
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const data = LessonSchema.parse(Object.fromEntries(formData));
    if ("lessonId" in target) {
      await api(`/admin/lessons/${target.lessonId}`, { method: "PATCH", body: data, auth: true });
    } else {
      await api(`/admin/modules/${target.moduleId}/lessons`, { method: "POST", body: data, auth: true });
    }
  } catch (error) {
    return toActionError(error);
  }
  refresh(courseId);
  redirect(`/admin/kelas/${courseId}/kurikulum?saved=1`);
}
