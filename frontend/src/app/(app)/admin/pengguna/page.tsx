import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteUser } from "@/features/users/actions";
import { getUsers } from "@/features/users/queries";
import { ActiveSwitch, CreateUserSheet } from "@/features/users/user-components";
import { getSessionUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pengguna" };

const ROLE = {
  admin: { label: "Administrator", variant: "default" },
  editor: { label: "Editor", variant: "secondary" },
  member: { label: "Member", variant: "outline" },
} as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const me = await getSessionUser();
  if (me?.role !== "admin") redirect("/admin");

  const sp = await searchParams;
  const data = await getUsers({ page: Number(sp.page) || 1, q: sp.q });

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader title="Pengguna" description="Kelola akses tim ke dashboard." actions={<CreateUserSheet />} />
      <SearchInput defaultValue={sp.q} placeholder="Cari nama atau email…" />
      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-6">Pengguna</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="pr-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((u) => {
              const self = u.id === me.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {u.full_name} {self && <span className="text-muted-foreground text-xs">(Anda)</span>}
                        </p>
                        <p className="text-muted-foreground text-xs">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE[u.role].variant}>{ROLE[u.role].label}</Badge>
                  </TableCell>
                  <TableCell>
                    <ActiveSwitch id={u.id} isActive={u.is_active} disabled={self} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                  <TableCell className="pr-6 text-right">
                    {!self && <DeleteButton action={deleteUser.bind(null, u.id)} label={u.full_name} />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <Pagination page={data.page} pages={data.pages} basePath="/admin/pengguna" params={{ q: sp.q }} />
    </div>
  );
}
