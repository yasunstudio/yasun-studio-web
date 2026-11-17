import { ArrowLeft, BarChart3, BookOpen, CheckCircle2, Clock, PlayCircle, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/features/courses/queries";
import { CurriculumList } from "@/features/learning/components/curriculum-list";
import { EnrollButton } from "@/features/learning/components/enroll-button";
import { ProgressBar } from "@/features/learning/components/progress-bar";
import { getLearnerCourse, getPublicCurriculum } from "@/features/learning/queries";
import { ApiError, safe } from "@/lib/api/client";
import { LEVEL_LABEL } from "@/lib/api/types";
import { getSessionUser } from "@/lib/auth/session";
import { formatDuration, formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getCourse(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await load((await params).slug);
  return { title: course.title, description: course.summary };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const [course, modules, user] = await Promise.all([
    load(slug),
    safe(getPublicCurriculum(slug), []),
    getSessionUser(),
  ]);
  const learner = user ? await safe(getLearnerCourse(slug), null) : null;
  const enrollment = learner?.enrollment ?? null;
  const firstLesson = modules[0]?.lessons[0];
  const resumeSlug =
    learner?.modules.flatMap((m) => m.lessons).find((l) => !l.completed)?.slug ?? firstLesson?.slug;

  // Enrolled → every lesson; otherwise preview lessons only (login required to view).
  const hrefFor = (lesson: { slug: string; is_preview: boolean }) =>
    enrollment || lesson.is_preview
      ? user
        ? `/belajar/${slug}/${lesson.slug}`
        : `/login?next=${encodeURIComponent(`/belajar/${slug}/${lesson.slug}`)}`
      : null;

  return (
    <>
      <section className="bg-brand-canvas relative overflow-hidden text-white">
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-page hero-y relative">
          <Link href="/kelas" className="inline-flex items-center gap-2 py-1 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Semua kelas
          </Link>
          <p className="text-eyebrow text-cyan-brand mt-6 uppercase">{course.category}</p>
          <h1 className="text-title-1 mt-2 max-w-3xl">{course.title}</h1>
          <p className="text-lead mt-4 max-w-2xl text-white/75">{course.summary}</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
            <Meta icon={BarChart3}>{LEVEL_LABEL[course.level]}</Meta>
            <Meta icon={BookOpen}>{course.lessons_count} materi</Meta>
            <Meta icon={Clock}>{formatDuration(course.duration_minutes)}</Meta>
          </div>
        </div>
      </section>

      <section className="container-page content-y grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-12">
          <article>
            <h2 className="text-heading">Tentang kelas ini</h2>
            <div className="mt-4">
              <Markdown>{course.description || course.summary}</Markdown>
            </div>
          </article>
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-heading">Kurikulum</h2>
              <span className="text-muted-foreground text-sm">
                {modules.length} bab · {course.lessons_count} materi
              </span>
            </div>
            <div className="mt-5">
              <CurriculumList modules={modules} hrefFor={hrefFor} />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            {enrollment ? (
              <>
                <p className="text-muted-foreground text-sm">Progres belajarmu</p>
                <p className="mt-1 text-metric">{enrollment.progress}%</p>
                <ProgressBar value={enrollment.progress} className="mt-3" />
                <p className="text-muted-foreground mt-2 text-xs">
                  {enrollment.completed_lessons} dari {course.lessons_count} materi selesai
                </p>
                <Button asChild size="lg" className="mt-6 h-11 w-full">
                  <Link href={resumeSlug ? `/belajar/${slug}/${resumeSlug}` : `/belajar/${slug}`}>
                    <PlayCircle /> {enrollment.progress > 0 ? "Lanjutkan Belajar" : "Mulai Belajar"}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">Investasi belajar</p>
                <p className="mt-1 text-metric">{formatPrice(course.price)}</p>
                <div className="mt-6">
                  {course.price === 0 ? (
                    <EnrollButton slug={slug} label={user ? "Mulai Belajar Gratis" : "Daftar & Mulai Gratis"} />
                  ) : (
                    <div className="grid gap-3">
                      <Button size="lg" className="h-11 w-full" disabled>
                        Pembayaran online segera hadir
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/kontak">Hubungi kami untuk mendaftar</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
            <ul className="mt-6 grid gap-3 text-sm">
              {["Akses materi selamanya", "Progres tersimpan otomatis", "Proyek praktik di setiap bab"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="text-brand size-4" /> {f}
                </li>
              ))}
            </ul>
            {course.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                <Tag className="text-muted-foreground size-4" />
                {course.tags.map((t) => (
                  <span key={t} className="bg-muted rounded-md px-2 py-0.5 font-mono text-xs">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}

function Meta({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="text-cyan-brand size-4" /> {children}
    </span>
  );
}
