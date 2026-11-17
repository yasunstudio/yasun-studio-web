import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { CourseForm } from "@/features/courses/components/course-form";
import { CourseTabs } from "@/features/courses/components/course-tabs";
import { getAdminCourse } from "@/features/courses/queries";
import { ApiError } from "@/lib/api/client";

export const metadata: Metadata = { title: "Ubah Kelas" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getAdminCourse(id).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  });
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader back={{ href: "/admin/kelas", label: "Kelas" }} title={course.title} description="Ubah informasi kelas" />
      <CourseTabs courseId={id} active="detail" />
      <CourseForm course={course} />
    </div>
  );
}
