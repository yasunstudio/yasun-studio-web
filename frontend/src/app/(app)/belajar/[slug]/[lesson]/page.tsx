import { ChevronLeft, ChevronRight, ListTree, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/shared/markdown";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CodeExercise } from "@/features/learning/assessments/code-exercise";
import { QuizPlayer } from "@/features/learning/assessments/quiz-player";
import { CompleteButton } from "@/features/learning/components/complete-button";
import { CurriculumList } from "@/features/learning/components/curriculum-list";
import { EnrollButton } from "@/features/learning/components/enroll-button";
import { LessonObjectives, LessonResources } from "@/features/learning/components/lesson-extras";
import { LessonNotes } from "@/features/learning/components/lesson-notes";
import { ProgressBar } from "@/features/learning/components/progress-bar";
import { VideoEmbed } from "@/features/learning/components/video-embed";
import { getLearnerCourse, getLessonView } from "@/features/learning/queries";
import { ApiError } from "@/lib/api/client";
import { KIND_LABEL, type LearnerCourse, type LessonKind } from "@/lib/api/types";
import { formatDuration, formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string; lesson: string }> };

// Quiz/exercise lessons complete by passing them, never by a manual tick.
const ASSESSED = new Set<LessonKind>(["quiz", "exercise"]);

async function loadCourse(slug: string) {
  try {
    return await getLearnerCourse(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lesson } = await params;
  const course = await loadCourse(slug);
  const found = course.modules.flatMap((m) => m.lessons).find((l) => l.slug === lesson);
  return { title: found ? `${found.title} · ${course.course.title}` : course.course.title };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lesson: lessonSlug } = await params;
  const [course, view] = await Promise.all([
    loadCourse(slug),
    getLessonView(slug, lessonSlug).catch((e) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }),
  ]);
  const meta = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title }))).find((l) => l.slug === lessonSlug);
  if (!meta) notFound();

  const enrolled = Boolean(course.enrollment);
  const hrefFor = (l: { slug: string; is_preview: boolean }) =>
    enrolled || l.is_preview ? `/belajar/${slug}/${l.slug}` : null;
  const outline = <CourseOutline course={course} activeSlug={lessonSlug} hrefFor={hrefFor} />;
  const nextHref = view?.next ? `/belajar/${slug}/${view.next.slug}` : null;

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        back={enrolled ? { href: `/belajar/${slug}`, label: course.course.title } : { href: `/kelas/${slug}`, label: course.course.title }}
        eyebrow={meta.module}
        title={meta.title}
        description={`${KIND_LABEL[meta.kind]} · ${formatDuration(meta.duration_minutes)}${
          view && !view.enrolled ? " · Pratinjau gratis" : ""
        }`}
        actions={
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <ListTree /> Daftar materi
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[340px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Daftar materi</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">{outline}</div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="min-w-0">
          <CardContent className="grid grid-cols-1 gap-8">
            {view ? (
              <>
                <LessonObjectives items={view.lesson.objectives} />
                {view.lesson.video_url && <VideoEmbed url={view.lesson.video_url} title={view.lesson.title} />}
                {view.lesson.content && <Markdown>{view.lesson.content}</Markdown>}

                {view.lesson.kind === "quiz" && view.lesson.quiz && (
                  <QuizPlayer
                    lessonId={view.lesson.id}
                    courseSlug={slug}
                    quiz={view.lesson.quiz}
                    assessment={view.assessment}
                    enrolled={view.enrolled}
                    nextHref={nextHref}
                  />
                )}
                {view.lesson.kind === "exercise" && view.lesson.exercise && (
                  <>
                    <Markdown>{view.lesson.exercise.instructions}</Markdown>
                    <CodeExercise
                      lessonId={view.lesson.id}
                      courseSlug={slug}
                      exercise={view.lesson.exercise}
                      assessment={view.assessment}
                      enrolled={view.enrolled}
                      nextHref={nextHref}
                    />
                  </>
                )}

                {(view.lesson.resources.length > 0 || view.enrolled) && (
                  <div className="grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
                    {view.enrolled && <LessonNotes lessonId={view.lesson.id} initial={view.note} />}
                    <LessonResources items={view.lesson.resources} />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                  {view.prev ? (
                    <Button asChild variant="ghost">
                      <Link href={`/belajar/${slug}/${view.prev.slug}`}>
                        <ChevronLeft /> <span className="max-w-48 truncate">{view.prev.title}</span>
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    {view.enrolled && !ASSESSED.has(view.lesson.kind) && (
                      <CompleteButton
                        key={view.lesson.id + String(view.completed)}
                        lessonId={view.lesson.id}
                        courseSlug={slug}
                        completed={view.completed}
                        nextHref={nextHref}
                      />
                    )}
                    {view.next && (
                      <Button asChild variant={view.enrolled ? "ghost" : "default"}>
                        <Link href={`/belajar/${slug}/${view.next.slug}`}>
                          <span className="max-w-48 truncate">{view.next.title}</span> <ChevronRight />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <LockedLesson course={course} slug={slug} />
            )}
          </CardContent>
        </Card>

        <Card className="hidden min-w-0 lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100dvh-8rem)] lg:self-start">
          <CardHeader>
            <CardTitle>Daftar materi</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-y-auto">{outline}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function CourseOutline({
  course,
  activeSlug,
  hrefFor,
}: {
  course: LearnerCourse;
  activeSlug: string;
  hrefFor: (l: { slug: string; is_preview: boolean }) => string | null;
}) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-6">
      {course.enrollment && (
        <div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-muted-foreground">Progres kelas</span>
            <span className="font-semibold tabular-nums">{course.enrollment.progress}%</span>
          </div>
          <ProgressBar value={course.enrollment.progress} />
        </div>
      )}
      <CurriculumList
        modules={course.modules}
        hrefFor={hrefFor}
        activeSlug={activeSlug}
        showProgress={Boolean(course.enrollment)}
        compact
      />
    </div>
  );
}

function LockedLesson({ course, slug }: { course: LearnerCourse; slug: string }) {
  const free = course.course.price === 0;
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <span className="bg-yellow-brand/20 mx-auto grid size-12 place-items-center rounded-xl">
        <Lock className="size-5" />
      </span>
      <h2 className="text-heading mt-6">Materi ini terkunci</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {free
          ? "Daftar ke kelas ini (gratis) untuk membuka seluruh materi dan menyimpan progresmu."
          : `Kelas ini berbayar (${formatPrice(course.course.price)}). Pembayaran online segera hadir.`}
      </p>
      <div className="mt-6">
        {free ? (
          <EnrollButton slug={slug} />
        ) : (
          <Button asChild variant="outline">
            <Link href="/kontak">Hubungi kami</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
