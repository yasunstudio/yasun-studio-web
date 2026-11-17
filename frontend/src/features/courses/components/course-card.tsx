import { BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { type CourseListItem, LEVEL_LABEL } from "@/lib/api/types";
import { cn, formatDuration, formatPrice } from "@/lib/utils";

const LEVEL_STYLE = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-brand/10 text-brand",
  advanced: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
} as const;

export function CourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/kelas/${course.slug}`}
      className="group bg-card hover:border-brand/40 relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgb(13_42_102/0.35)]"
    >
      <div className="bg-brand-canvas relative aspect-[16/9] overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="bg-grid absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center">
              <LogoMark variant="color" className="size-16 text-white opacity-90 transition duration-500 group-hover:scale-110" />
            </div>
            <span className="absolute bottom-3 left-4 font-mono text-xs text-cyan-brand/90">
              {"<"}
              {course.category.toLowerCase().replace(/\s+/g, "-")}
              {" />"}
            </span>
          </>
        )}
        {course.is_featured && (
          <span className="bg-yellow-brand text-navy-950 absolute top-3 left-3 rounded-md px-2 py-0.5 text-xs font-bold">
            Unggulan
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("border-0", LEVEL_STYLE[course.level])}>
            {LEVEL_LABEL[course.level]}
          </Badge>
          <span className="text-muted-foreground text-xs">{course.category}</span>
        </div>
        <h3 className="group-hover:text-brand text-heading mt-3 line-clamp-2 transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground mt-2 mb-6 line-clamp-2 text-sm leading-relaxed">{course.summary}</p>

        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2">
              <BookOpen className="size-3.5" /> {course.lessons_count} materi
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-3.5" /> {formatDuration(course.duration_minutes)}
            </span>
          </div>
          <span className={cn("text-sm font-bold", course.price === 0 && "text-brand")}>
            {formatPrice(course.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
