import { BookOpen, ListTree, Pencil, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteCourse } from "@/features/courses/actions";
import { getAdminCourses } from "@/features/courses/queries";
import { LEVEL_LABEL } from "@/lib/api/types";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Kelas" };

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const data = await getAdminCourses({ page: Number(sp.page) || 1, q: sp.q });

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title="Kelas"
        description={`${data.total} kelas terdaftar`}
        actions={
          <Button asChild>
            <Link href="/admin/kelas/baru">
              <Plus /> Kelas Baru
            </Link>
          </Button>
        }
      />
      <SearchInput defaultValue={sp.q} placeholder="Cari judul kelas…" />

      {data.items.length === 0 ? (
        <EmptyState icon={BookOpen} title="Belum ada kelas" description="Buat kelas pertama Anda." />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-6">Judul</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Materi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-sm pl-6">
                    <div className="flex items-center gap-2">
                      {c.is_featured && <Star aria-label="Unggulan" className="fill-yellow-brand text-yellow-brand size-4 shrink-0" />}
                      <span className="truncate font-medium">{c.title}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{c.category}</p>
                  </TableCell>
                  <TableCell>{LEVEL_LABEL[c.level]}</TableCell>
                  <TableCell className="tabular-nums">{c.lessons_count}</TableCell>
                  <TableCell className="tabular-nums">{formatPrice(c.price)}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_published ? "default" : "secondary"}>{c.is_published ? "Terbit" : "Draf"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button asChild variant="ghost" size="icon" aria-label={`Kurikulum ${c.title}`}>
                      <Link href={`/admin/kelas/${c.id}/kurikulum`}>
                        <ListTree />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label={`Ubah ${c.title}`}>
                      <Link href={`/admin/kelas/${c.id}`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <DeleteButton action={deleteCourse.bind(null, c.id)} label={c.title} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/admin/kelas" params={{ q: sp.q }} />
    </div>
  );
}
