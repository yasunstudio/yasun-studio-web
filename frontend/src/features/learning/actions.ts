"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, toActionError } from "@/lib/actions";
import { api } from "@/lib/api/client";
import type { ExerciseResult, ProgressResult, QuizResult } from "@/lib/api/types";
import { getSessionUser } from "@/lib/auth/session";

export async function enrollCourse(slug: string): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) redirect(`/daftar?next=${encodeURIComponent(`/kelas/${slug}`)}`);
  try {
    await api("/me/enrollments", { method: "POST", body: { course_slug: slug }, auth: true });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath("/belajar");
  redirect(`/belajar/${slug}`);
}

export async function setLessonCompleted(
  lessonId: string,
  courseSlug: string,
  done: boolean,
): Promise<ActionState & { result?: ProgressResult }> {
  try {
    const result = await api<ProgressResult>(`/me/lessons/${lessonId}/complete`, {
      method: done ? "PUT" : "DELETE",
      auth: true,
    });
    revalidatePath(`/belajar/${courseSlug}`, "layout");
    revalidatePath("/belajar");
    return { ok: true, result };
  } catch (error) {
    return toActionError(error);
  }
}

function refreshLearning(courseSlug: string) {
  revalidatePath(`/belajar/${courseSlug}`, "layout");
  revalidatePath("/belajar");
}

/** Quiz answers are graded on the server; the answer key never reaches the browser. */
export async function submitQuiz(
  lessonId: string,
  courseSlug: string,
  answers: Record<string, string[]>,
): Promise<ActionState & { result?: QuizResult }> {
  try {
    const result = await api<QuizResult>(`/me/lessons/${lessonId}/quiz/attempts`, {
      method: "POST",
      body: { answers },
      auth: true,
    });
    if (result.passed) refreshLearning(courseSlug);
    return { ok: true, result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function submitExercise(
  lessonId: string,
  courseSlug: string,
  code: string,
  output: string,
): Promise<ActionState & { result?: ExerciseResult }> {
  try {
    const result = await api<ExerciseResult>(`/me/lessons/${lessonId}/exercise/attempts`, {
      method: "POST",
      body: { code, output },
      auth: true,
    });
    if (result.passed) refreshLearning(courseSlug);
    return { ok: true, result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function fetchSolution(lessonId: string): Promise<ActionState & { solution?: string }> {
  try {
    const res = await api<{ solution: string }>(`/me/lessons/${lessonId}/exercise/solution`, { auth: true });
    return { ok: true, solution: res.solution };
  } catch (error) {
    return toActionError(error);
  }
}

export async function saveNote(lessonId: string, content: string): Promise<ActionState> {
  try {
    await api(`/me/lessons/${lessonId}/note`, { method: "PUT", body: { content }, auth: true });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
