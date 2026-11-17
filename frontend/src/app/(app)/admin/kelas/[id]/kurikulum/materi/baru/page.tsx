import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { LessonForm } from "@/features/curriculum/components/lesson-form";
import { getAdminCurriculum } from "@/features/curriculum/queries";

export const metadata: Metadata = { title: "Materi Baru" };

export default async function NewLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bab?: string }>;
}) {
  const [{ id }, { bab }] = await Promise.all([params, searchParams]);
  const modules = await getAdminCurriculum(id);
  const mod = modules.find((m) => m.id === bab);
  if (!mod) notFound();

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader back={{ href: `/admin/kelas/${id}/kurikulum`, label: "Kurikulum" }} title="Materi Baru" description={`Ditambahkan ke ${mod.title}`} />
      <LessonForm courseId={id} moduleId={mod.id} />
    </div>
  );
}
