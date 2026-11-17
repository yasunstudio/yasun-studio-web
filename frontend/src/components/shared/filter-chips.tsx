import Link from "next/link";

import { cn } from "@/lib/utils";

export type FilterChip = { key: string; label: string; href: string; active: boolean };

/** URL-driven filter pills — one style for every list page (public + app). */
export function FilterChips({ items, label, className }: { items: FilterChip[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {items.map((c) => (
        <Link
          key={c.key}
          href={c.href}
          aria-current={c.active ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
            c.active
              ? "bg-primary text-primary-foreground border-transparent"
              : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
