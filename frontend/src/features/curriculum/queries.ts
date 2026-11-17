import "server-only";

import { api } from "@/lib/api/client";
import type { Lesson, ModuleOutline } from "@/lib/api/types";

export function getAdminCurriculum(courseId: string) {
  return api<ModuleOutline[]>(`/admin/courses/${courseId}/curriculum`, { auth: true });
}

export function getAdminLesson(lessonId: string) {
  return api<Lesson>(`/admin/lessons/${lessonId}`, { auth: true });
}
