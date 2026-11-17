import "server-only";

import { api } from "@/lib/api/client";
import type { Course, CourseLevel, CourseListItem, Page } from "@/lib/api/types";

export const COURSES_TAG = "courses";

export function getCourses(query: {
  page?: number;
  size?: number;
  q?: string;
  category?: string;
  level?: CourseLevel;
  featured?: boolean;
} = {}) {
  return api<Page<CourseListItem>>("/courses", { query, tags: [COURSES_TAG] });
}

export function getCourse(slug: string) {
  return api<Course>(`/courses/${encodeURIComponent(slug)}`, { tags: [COURSES_TAG] });
}

// --- admin -----------------------------------------------------------------
export function getAdminCourses(query: { page?: number; q?: string } = {}) {
  return api<Page<CourseListItem>>("/admin/courses", { auth: true, query: { size: 20, ...query } });
}

export function getAdminCourse(id: string) {
  return api<Course>(`/admin/courses/${id}`, { auth: true });
}
