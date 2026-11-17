import { Newspaper, Pencil, Plus } from "lucide-react";
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
import { deletePost } from "@/features/posts/actions";
import { getAdminPosts } from "@/features/posts/queries";
import { POST_STATUS_LABEL, type PostStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Artikel" };

const STATUS_VARIANT: Record<PostStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const data = await getAdminPosts({ page: Number(sp.page) || 1, q: sp.q });

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title="Artikel"
        description={`${data.total} artikel`}
        actions={
          <Button asChild>
            <Link href="/admin/artikel/baru">
              <Plus /> Tulis Artikel
            </Link>
          </Button>
        }
      />
      <SearchInput defaultValue={sp.q} placeholder="Cari judul artikel…" />

      {data.items.length === 0 ? (
        <EmptyState icon={Newspaper} title="Belum ada artikel" description="Mulai menulis artikel pertama." />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-6">Judul</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terbit</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-md pl-6">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-muted-foreground font-mono text-xs">/{p.slug}</p>
                  </TableCell>
                  <TableCell>{p.author?.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[p.status]}>{POST_STATUS_LABEL[p.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.published_at)}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button asChild variant="ghost" size="icon" aria-label={`Ubah ${p.title}`}>
                      <Link href={`/admin/artikel/${p.id}`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <DeleteButton action={deletePost.bind(null, p.id)} label={p.title} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/admin/artikel" params={{ q: sp.q }} />
    </div>
  );
}
