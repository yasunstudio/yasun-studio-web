import { Inbox } from "lucide-react";
import type { Metadata } from "next";

import { FilterChips } from "@/components/shared/filter-chips";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { deleteMessage } from "@/features/messages/actions";
import { ToggleReadButton } from "@/features/messages/message-actions";
import { getMessages } from "@/features/messages/queries";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pesan Masuk" };

const FILTERS = [
  { key: undefined, label: "Semua" },
  { key: "unread", label: "Belum dibaca" },
] as const;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const unread = sp.filter === "unread" ? true : undefined;
  const data = await getMessages({ page: Number(sp.page) || 1, unread });

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader title="Pesan Masuk" description="Pesan dari formulir kontak situs publik." />
      <FilterChips
        label="Filter pesan"
        items={FILTERS.map((f) => ({
          key: f.label,
          label: f.label,
          href: f.key ? `/admin/pesan?filter=${f.key}` : "/admin/pesan",
          active: sp.filter === f.key,
        }))}
      />

      {data.items.length === 0 ? (
        <EmptyState icon={Inbox} title="Kotak masuk kosong" description="Belum ada pesan untuk ditampilkan." />
      ) : (
        <div className="grid gap-3">
          {data.items.map((m) => (
            <Card key={m.id} className={cn("py-0", !m.is_read && "border-l-yellow-brand border-l-4")}>
              <CardContent className="grid gap-3 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.subject}</p>
                    <p className="text-muted-foreground text-sm">
                      {m.name} ·{" "}
                      <a href={`mailto:${m.email}`} className="text-brand underline underline-offset-4">
                        {m.email}
                      </a>{" "}
                      · {formatDate(m.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <ToggleReadButton id={m.id} isRead={m.is_read} />
                    <DeleteButton action={deleteMessage.bind(null, m.id)} label={m.subject} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/admin/pesan" params={{ filter: sp.filter }} />
    </div>
  );
}
