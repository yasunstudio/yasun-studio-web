import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { LessonForm } from "@/features/curriculum/components/lesson-form";
import { getAdminLesson } from "@/features/curriculum/queries";
import { ApiError } from "@/lib/api/client";

export const metadata: Metadata = { title: "Ubah Materi" };

export default async function EditLessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const lesson = await getAdminLesson(lessonId).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  });
  if (lesson.course_id !== id) notFound();

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader back={{ href: `/admin/kelas/${id}/kurikulum`, label: "Kurikulum" }} title="Ubah Materi" description={lesson.title} />
      <LessonForm courseId={id} lesson={lesson} />
    </div>
  );
}
