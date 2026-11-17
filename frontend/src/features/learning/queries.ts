import "server-only";

import { COURSES_TAG } from "@/features/courses/queries";
import { api, ApiError } from "@/lib/api/client";
import type { Enrollment, LearnerCourse, LessonView, ModuleOutline } from "@/lib/api/types";

/** Public outline (no lesson content) — cached with the course catalogue. */
export function getPublicCurriculum(slug: string) {
  return api<ModuleOutline[]>(`/courses/${encodeURIComponent(slug)}/curriculum`, { tags: [COURSES_TAG] });
}

export function getMyEnrollments() {
  return api<Enrollment[]>("/me/enrollments", { auth: true });
}

export function getLearnerCourse(slug: string) {
  return api<LearnerCourse>(`/me/courses/${encodeURIComponent(slug)}`, { auth: true });
}

/** Returns null when the lesson is locked (403) so the page can show a paywall-style gate. */
export async function getLessonView(courseSlug: string, lessonSlug: string): Promise<LessonView | null> {
  try {
    return await api<LessonView>(
      `/me/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
      { auth: true },
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) return null;
    throw e;
  }
}
