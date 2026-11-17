import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CourseTabs } from "@/features/courses/components/course-tabs";
import { getAdminCourse } from "@/features/courses/queries";
import { CurriculumEditor } from "@/features/curriculum/components/curriculum-editor";
import { getAdminCurriculum } from "@/features/curriculum/queries";
import { ApiError } from "@/lib/api/client";
import { formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Kurikulum" };

export default async function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, modules] = await Promise.all([
    getAdminCourse(id).catch((e) => {
      if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
      throw e;
    }),
    getAdminCurriculum(id),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        back={{ href: "/admin/kelas", label: "Kelas" }}
        title={course.title}
        description={`${course.lessons_count} materi · ${formatDuration(course.duration_minutes)}`}
        actions={
          course.is_published && (
            <Button asChild variant="outline">
              <Link href={`/kelas/${course.slug}`} target="_blank">
                <ExternalLink /> Lihat di situs
              </Link>
            </Button>
          )
        }
      />
      <CourseTabs courseId={id} active="kurikulum" />
      <CurriculumEditor courseId={id} modules={modules} />
    </div>
  );
}
