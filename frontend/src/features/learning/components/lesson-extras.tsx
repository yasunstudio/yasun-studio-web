import { BookOpen, ExternalLink, FileDown, Newspaper, PlayCircle, Target, Wrench } from "lucide-react";

import type { Resource, ResourceKind } from "@/lib/api/types";

/** "Setelah materi ini kamu mampu…" — sets expectations before learning starts. */
export function LessonObjectives({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="objectives-title" className="border-brand/20 bg-brand/5 rounded-xl border p-6">
      <h2 id="objectives-title" className="flex items-center gap-2 text-sm font-semibold">
        <Target className="text-brand size-4" /> Setelah materi ini kamu mampu
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((o) => (
          <li key={o} className="flex items-start gap-2 text-sm">
            <span className="bg-cyan-brand mt-2 size-1.5 shrink-0 rounded-full" aria-hidden />
            {o}
          </li>
        ))}
      </ul>
    </section>
  );
}

const RESOURCE_ICON: Record<ResourceKind, typeof BookOpen> = {
  docs: BookOpen,
  article: Newspaper,
  video: PlayCircle,
  download: FileDown,
  tool: Wrench,
};
const RESOURCE_LABEL: Record<ResourceKind, string> = {
  docs: "Dokumentasi",
  article: "Artikel",
  video: "Video",
  download: "Unduhan",
  tool: "Tool",
};

export function LessonResources({ items }: { items: Resource[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="resources-title" className="grid gap-3">
      <h2 id="resources-title" className="text-sm font-semibold">
        Sumber belajar
      </h2>
      <ul className="grid gap-2">
        {items.map((r) => {
          const Icon = RESOURCE_ICON[r.kind];
          return (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-brand/40 hover:bg-muted/40 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors"
              >
                <span className="bg-muted grid size-8 shrink-0 place-items-center rounded-md">
                  <Icon className="text-brand size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="group-hover:text-brand block truncate font-medium">{r.title}</span>
                  <span className="text-muted-foreground text-xs">{RESOURCE_LABEL[r.kind]}</span>
                </span>
                <ExternalLink className="text-muted-foreground size-4 shrink-0" aria-label="Buka di tab baru" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
