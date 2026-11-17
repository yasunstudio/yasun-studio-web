import { CheckCircle2, Circle, Code2, FileText, ListChecks, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";

import type { LessonOutline } from "@/lib/api/types";
import { cn, formatDuration } from "@/lib/utils";

type Lesson = LessonOutline & { completed?: boolean };
type Module = { id: string; title: string; lessons: Lesson[] };

/**
 * Course outline used on the public course page and in the learner area.
 * `hrefFor` returns a link for lessons the viewer may open, or null (locked).
 */
export function CurriculumList({
  modules,
  hrefFor,
  activeSlug,
  showProgress = false,
  compact = false,
}: {
  modules: Module[];
  hrefFor: (lesson: Lesson) => string | null;
  activeSlug?: string;
  showProgress?: boolean;
  compact?: boolean;
}) {
  if (modules.length === 0) {
    return <p className="text-muted-foreground text-sm">Kurikulum sedang disiapkan.</p>;
  }
  return (
    <ol className={cn("grid grid-cols-1", compact ? "gap-6" : "gap-4")}>
      {modules.map((m, mi) => {
        const minutes = m.lessons.reduce((t, l) => t + l.duration_minutes, 0);
        return (
          <li key={m.id} className={cn(!compact && "bg-card overflow-hidden rounded-xl border shadow-sm")}>
            <div className={cn("flex items-baseline justify-between gap-3", compact ? "px-1 pb-2" : "bg-muted/50 border-b px-6 py-3")}>
              <h3 className={cn("font-semibold", compact && "text-sm")}>
                <span className="text-brand mr-2 font-mono text-xs">{String(mi + 1).padStart(2, "0")}</span>
                {m.title}
              </h3>
              {!compact && (
                <span className="text-muted-foreground shrink-0 text-xs">
                  {m.lessons.length} materi · {formatDuration(minutes)}
                </span>
              )}
            </div>
            <ul className={cn(!compact && "divide-y")}>
              {m.lessons.map((lesson) => {
                const href = hrefFor(lesson);
                const active = lesson.slug === activeSlug;
                const KindIcon = { video: PlayCircle, article: FileText, quiz: ListChecks, exercise: Code2 }[lesson.kind];
                const StatusIcon = !href ? Lock : showProgress ? (lesson.completed ? CheckCircle2 : Circle) : KindIcon;
                const body = (
                  <>
                    <StatusIcon
                      className={cn(
                        "size-4 shrink-0",
                        lesson.completed && showProgress ? "text-success" : "text-muted-foreground",
                        active && "text-brand",
                      )}
                    />
                    <span className={cn("min-w-0 flex-1 truncate", active && "text-foreground font-semibold")}>
                      {lesson.title}
                    </span>
                    {lesson.is_preview && !showProgress && (
                      <span className="bg-yellow-brand/20 text-foreground rounded px-1.5 py-0.5 text-xs font-bold uppercase">
                        Pratinjau
                      </span>
                    )}
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {formatDuration(lesson.duration_minutes)}
                    </span>
                  </>
                );
                const cls = cn(
                  "flex items-center gap-3 text-sm",
                  compact ? "rounded-lg px-2 py-2" : "px-6 py-3",
                  href && "hover:bg-muted transition-colors",
                  active && "bg-accent",
                  !href && "text-muted-foreground",
                );
                return (
                  <li key={lesson.id}>
                    {href ? (
                      <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
                        {body}
                      </Link>
                    ) : (
                      <div className={cls}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
