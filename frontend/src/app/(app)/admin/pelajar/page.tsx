import { GraduationCap, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FilterChips } from "@/components/shared/filter-chips";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initials } from "@/features/account/account-menu";
import { getAdminCourses } from "@/features/courses/queries";
import { ProgressBar } from "@/features/learning/components/progress-bar";
import { api } from "@/lib/api/client";
import type { AdminEnrollment, Page } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pelajar" };

export default async function LearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; course?: string }>;
}) {
  const sp = await searchParams;
  const [data, courses] = await Promise.all([
    api<Page<AdminEnrollment>>("/admin/enrollments", {
      auth: true,
      query: { page: Number(sp.page) || 1, size: 20, q: sp.q, course_id: sp.course },
    }),
    getAdminCourses({ page: 1 }),
  ]);
  const activeCourse = courses.items.find((c) => c.id === sp.course);

  const courseHref = (id?: string) => {
    const p = new URLSearchParams();
    if (sp.q) p.set("q", sp.q);
    if (id) p.set("course", id);
    const s = p.toString();
    return s ? `/admin/pelajar?${s}` : "/admin/pelajar";
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title="Pelajar"
        description={
          activeCourse ? `${data.total} pelajar di “${activeCourse.title}”` : `${data.total} pendaftaran kelas`
        }
      />

      <div className="flex flex-col gap-4">
        <SearchInput defaultValue={sp.q} placeholder="Cari nama atau email pelajar…" />
        <FilterChips
          label="Filter kelas"
          items={[{ id: undefined, title: "Semua kelas" }, ...courses.items].map((c) => ({
            key: c.id ?? "all",
            label: c.title,
            href: courseHref(c.id),
            active: sp.course === c.id,
          }))}
        />
      </div>

      {data.items.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Belum ada pelajar" description="Pendaftaran kelas akan muncul di sini." />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-6">Pelajar</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="w-48">Progres</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="pr-6">Aktivitas terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                          {initials(e.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{e.user.full_name}</p>
                        <p className="text-muted-foreground text-xs">{e.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <Link href={`/admin/kelas/${e.course.id}`} className="hover:text-brand block truncate py-1">
                      {e.course.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={e.progress} className="w-24" />
                      <span className="text-xs font-semibold tabular-nums">{e.progress}%</span>
                      {e.status === "completed" && (
                        <Badge className="bg-success/10 text-success">
                          <Trophy />
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(e.created_at)}</TableCell>
                  <TableCell className="text-muted-foreground pr-6">{formatDate(e.last_accessed_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/admin/pelajar" params={{ q: sp.q, course: sp.course }} />
    </div>
  );
}
