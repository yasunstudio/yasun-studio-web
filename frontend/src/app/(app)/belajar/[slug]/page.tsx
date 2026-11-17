import { PlayCircle, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurriculumList } from "@/features/learning/components/curriculum-list";
import { ProgressBar } from "@/features/learning/components/progress-bar";
import { getLearnerCourse } from "@/features/learning/queries";
import { ApiError } from "@/lib/api/client";
import { formatDuration } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getLearnerCourse(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await load((await params).slug)).course.title };
}

export default async function LearnerCoursePage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data.enrollment) redirect(`/kelas/${slug}`);

  const { course, enrollment, modules } = data;
  const lessons = modules.flatMap((m) => m.lessons);
  const resume = lessons.find((l) => !l.completed) ?? lessons[0];
  const done = enrollment.status === "completed";

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        back={{ href: "/belajar", label: "Kelas Saya" }}
        eyebrow={course.category}
        title={course.title}
        description={course.summary}
        actions={
          resume && (
            <Button asChild>
              <Link href={`/belajar/${slug}/${resume.slug}`}>
                <PlayCircle /> {done ? "Ulas kembali" : enrollment.progress > 0 ? "Lanjutkan" : "Mulai"}
              </Link>
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Kurikulum</CardTitle>
          </CardHeader>
          <CardContent>
            <CurriculumList modules={modules} showProgress compact hrefFor={(l) => `/belajar/${slug}/${l.slug}`} />
          </CardContent>
        </Card>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Progres</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-metric">{enrollment.progress}%</p>
              <ProgressBar value={enrollment.progress} className="h-2.5" />
              <p className="text-muted-foreground text-sm">
                {enrollment.completed_lessons} dari {course.lessons_count} materi ·{" "}
                {formatDuration(course.duration_minutes)}
              </p>
            </CardContent>
          </Card>
          {done && (
            <Card className="border-success/30 bg-success/10">
              <CardContent className="flex gap-3 text-sm">
                <Trophy className="size-5 shrink-0 text-success" />
                <span>
                  <b>Selamat!</b> Kamu telah menuntaskan kelas ini. Sertifikat tersedia pada pembaruan berikutnya.
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
