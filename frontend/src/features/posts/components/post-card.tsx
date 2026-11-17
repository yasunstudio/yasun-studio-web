import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { PostListItem } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/artikel/${post.slug}`}
      className="group bg-card hover:border-brand/40 flex flex-col rounded-xl border p-6 transition-all duration-300 hover:shadow-[0_18px_40px_-20px_rgb(13_42_102/0.3)]"
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        <span aria-hidden>·</span>
        <span>{post.reading_minutes} menit baca</span>
      </div>
      <h3 className="group-hover:text-brand text-heading mt-3 flex items-start justify-between gap-3 transition-colors">
        <span className="line-clamp-2">{post.title}</span>
        <ArrowUpRight className="text-muted-foreground group-hover:text-brand mt-0.5 size-5 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </h3>
      <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>
      {post.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {post.tags.map((t) => (
            <span key={t} className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 font-mono text-xs">
              #{t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
