import Link from "next/link";

import { cn } from "@/lib/utils";

/** Detail / Kurikulum / Pelajar tabs on the course edit screens. */
export function CourseTabs({ courseId, active }: { courseId: string; active: "detail" | "kurikulum" | "pelajar" }) {
  const tabs = [
    { key: "detail", label: "Detail", href: `/admin/kelas/${courseId}` },
    { key: "kurikulum", label: "Kurikulum", href: `/admin/kelas/${courseId}/kurikulum` },
    { key: "pelajar", label: "Pelajar", href: `/admin/pelajar?course=${courseId}` },
  ] as const;
  return (
    <nav className="bg-muted inline-flex w-fit gap-1 rounded-lg p-1" aria-label="Bagian kelas">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition",
            active === t.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
