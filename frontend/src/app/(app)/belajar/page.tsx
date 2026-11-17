import { ArrowRight, BookOpenCheck, Compass, GraduationCap, PlayCircle, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/features/learning/components/progress-bar";
import { getMyEnrollments } from "@/features/learning/queries";
import { LEVEL_LABEL } from "@/lib/api/types";
import { getSessionUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Kelas Saya" };

export default async function MyLearningPage() {
  const [user, enrollments] = await Promise.all([getSessionUser(), getMyEnrollments()]);
  const current = enrollments.find((e) => e.status === "active");
  const completed = enrollments.filter((e) => e.status === "completed").length;
  const lessonsDone = enrollments.reduce((t, e) => t + e.completed_lessons, 0);

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title={`Halo, ${user?.name.split(" ")[0] ?? "Pelajar"} 👋`}
        description="Satu materi hari ini lebih baik daripada sepuluh materi besok."
        actions={
          <Button asChild variant="outline">
            <Link href="/kelas">
              <Compass /> Jelajahi Kelas
            </Link>
          </Button>
        }
      />

      {current && (
        <Card className="bg-brand-canvas relative overflow-hidden border-0 text-white">
          <div className="bg-grid absolute inset-0" />
          <LogoMark className="absolute -right-6 -bottom-8 size-44 text-white opacity-10" />
          <CardContent className="relative max-w-2xl">
            <p className="text-eyebrow text-cyan-brand">Lanjutkan belajar</p>
            <h2 className="text-title-3 mt-1">{current.course.title}</h2>
            <div className="mt-5 flex items-center gap-4">
              <ProgressBar value={current.progress} className="h-2.5 max-w-sm bg-white/15" />
              <span className="text-sm font-semibold tabular-nums">{current.progress}%</span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              {current.completed_lessons} dari {current.course.lessons_count} materi selesai
            </p>
            <Button asChild className="bg-cyan-brand text-navy-950 hover:bg-cyan-brand/90 mt-6 font-semibold">
              <Link href={`/belajar/${current.course.slug}`}>
                <PlayCircle /> Lanjutkan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Kelas diikuti" value={enrollments.length} icon={GraduationCap} tone="navy" />
        <StatCard label="Materi selesai" value={lessonsDone} icon={BookOpenCheck} tone="cyan" />
        <StatCard label="Kelas tuntas" value={completed} icon={Trophy} tone="yellow" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua kelas saya</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link href="/kelas">
                Jelajahi <ArrowRight />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="Belum ada kelas"
              description="Pilih kelas pertamamu — banyak yang gratis untuk memulai dari nol."
              action={
                <Button asChild>
                  <Link href="/kelas">Jelajahi Kelas</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {enrollments.map((e) => (
                <Link
                  key={e.id}
                  href={`/belajar/${e.course.slug}`}
                  className="group hover:border-brand/40 hover:bg-muted/40 flex flex-col rounded-xl border p-6 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{LEVEL_LABEL[e.course.level]}</Badge>
                    {e.status === "completed" && (
                      <Badge className="bg-success/10 text-success">
                        <Trophy /> Tuntas
                      </Badge>
                    )}
                  </div>
                  <h3 className="group-hover:text-brand mt-3 line-clamp-2 font-semibold transition-colors">
                    {e.course.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">{e.course.category}</p>
                  <div className="mt-auto pt-5">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {e.completed_lessons}/{e.course.lessons_count} materi
                      </span>
                      <span className="font-semibold tabular-nums">{e.progress}%</span>
                    </div>
                    <ProgressBar value={e.progress} />
                    <p className="text-muted-foreground mt-3 text-xs">
                      {e.last_accessed_at
                        ? `Terakhir dibuka ${formatDate(e.last_accessed_at)}`
                        : `Terdaftar ${formatDate(e.created_at)}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
