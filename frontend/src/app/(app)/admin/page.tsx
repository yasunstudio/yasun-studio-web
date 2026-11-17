import { ArrowRight, BookOpen, GraduationCap, Mail, Newspaper, Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCourses } from "@/features/courses/queries";
import { getDashboardStats } from "@/features/dashboard/queries";
import { getMessages } from "@/features/messages/queries";
import { getSessionUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, stats, courses, messages] = await Promise.all([
    getSessionUser(),
    getDashboardStats(),
    getAdminCourses({ page: 1 }),
    getMessages({ page: 1, unread: true }),
  ]);

  const cards = [
    { label: "Total Kelas", value: stats.courses_total, sub: `${stats.courses_published} terbit`, icon: BookOpen, href: "/admin/kelas", tone: "navy" as const },
    { label: "Total Artikel", value: stats.posts_total, sub: `${stats.posts_published} terbit`, icon: Newspaper, href: "/admin/artikel", tone: "cyan" as const },
    { label: "Pesan Belum Dibaca", value: stats.messages_unread, sub: "perlu ditindaklanjuti", icon: Mail, href: "/admin/pesan", tone: "yellow" as const },
    { label: "Pelajar", value: stats.learners_total, sub: `${stats.enrollments_total} pendaftaran kelas`, icon: GraduationCap, href: "/admin/pelajar", tone: "muted" as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title={`Halo, ${user?.name.split(" ")[0] ?? "Admin"} 👋`}
        description="Ringkasan aktivitas Yasun Studio hari ini."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/artikel/baru">
                <Plus /> Artikel
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/kelas/baru">
                <Plus /> Kelas Baru
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Kelas terbaru</CardTitle>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/kelas">
                  Kelola <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-1">
            {courses.items.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/admin/kelas/${c.id}`}
                className="hover:bg-muted -mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-muted-foreground text-xs">{c.category}</p>
                </div>
                <Badge variant={c.is_published ? "default" : "secondary"}>
                  {c.is_published ? "Terbit" : "Draf"}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pesan belum dibaca</CardTitle>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/pesan">
                  Semua <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {messages.items.length === 0 && (
              <p className="text-muted-foreground py-6 text-center text-sm">Semua pesan sudah dibaca 🎉</p>
            )}
            {messages.items.slice(0, 5).map((m) => (
              <div key={m.id} className="border-l-yellow-brand border-l-2 pl-3">
                <p className="truncate text-sm font-semibold">{m.subject}</p>
                <p className="text-muted-foreground text-xs">
                  {m.name} · {formatDate(m.created_at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
