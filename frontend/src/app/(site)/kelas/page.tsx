import { GraduationCap, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { FilterChips } from "@/components/shared/filter-chips";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/features/courses/components/course-card";
import { getCourses } from "@/features/courses/queries";
import { PageHero } from "@/features/site/page-hero";
import { type CourseLevel, LEVEL_LABEL } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Kelas",
  description: "Kelas coding & AI terstruktur dari level pemula hingga lanjutan.",
};

const LEVELS = Object.entries(LEVEL_LABEL) as [CourseLevel, string][];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; level?: string }>;
}) {
  await connection();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const level = LEVELS.some(([k]) => k === sp.level) ? (sp.level as CourseLevel) : undefined;
  const data = await getCourses({ page, size: 9, q: sp.q, level });

  const levelHref = (l?: CourseLevel) => {
    const p = new URLSearchParams();
    if (sp.q) p.set("q", sp.q);
    if (l) p.set("level", l);
    const s = p.toString();
    return s ? `/kelas?${s}` : "/kelas";
  };

  return (
    <>
      <PageHero
        eyebrow="Katalog kelas"
        title="Pilih jalur belajarmu"
        description="Semua kelas disusun bertahap: pahami konsep, praktikkan, lalu bangun proyek nyata."
      >
        <form action="/kelas" className="flex max-w-xl gap-2">
          {level && <input type="hidden" name="level" value={level} />}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/50" />
            <Input
              name="q"
              defaultValue={sp.q}
              placeholder="Cari kelas… (mis. Python, Next.js, AI)"
              className="h-11 border-white/15 bg-white/10 pl-9 text-white placeholder:text-white/50"
            />
          </div>
          <Button type="submit" size="lg" className="bg-cyan-brand text-navy-950 hover:bg-cyan-brand/90 h-11">
            Cari
          </Button>
        </form>
      </PageHero>

      <section className="container-page content-y">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterChips
            label="Filter level"
            items={[[undefined, "Semua"] as const, ...LEVELS].map(([key, label]) => ({
              key: label,
              label,
              href: levelHref(key),
              active: level === key,
            }))}
          />
          <span className="text-muted-foreground text-sm">{data.total} kelas</span>
        </div>

        {data.items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={GraduationCap}
              title="Kelas tidak ditemukan"
              description="Coba kata kunci lain atau hapus filter level."
              action={
                <Button asChild variant="outline">
                  <Link href="/kelas">Reset pencarian</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination page={data.page} pages={data.pages} basePath="/kelas" params={{ q: sp.q, level }} />
        </div>
      </section>
    </>
  );
}
