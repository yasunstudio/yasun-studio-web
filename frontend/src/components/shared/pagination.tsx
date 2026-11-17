import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** URL-driven pagination (works in Server Components, no client JS). */
export function Pagination({
  page,
  pages,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };
  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Paginasi">
      <p className="text-muted-foreground text-sm">
        Halaman <span className="text-foreground font-semibold">{page}</span> dari {pages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild disabled={page <= 1}>
          {page > 1 ? (
            <Link href={href(page - 1)}>
              <ChevronLeft /> Sebelumnya
            </Link>
          ) : (
            <span aria-disabled className="pointer-events-none opacity-50">
              <ChevronLeft /> Sebelumnya
            </span>
          )}
        </Button>
        <Button variant="outline" size="sm" asChild>
          {page < pages ? (
            <Link href={href(page + 1)}>
              Berikutnya <ChevronRight />
            </Link>
          ) : (
            <span aria-disabled className="pointer-events-none opacity-50">
              Berikutnya <ChevronRight />
            </span>
          )}
        </Button>
      </div>
    </nav>
  );
}
