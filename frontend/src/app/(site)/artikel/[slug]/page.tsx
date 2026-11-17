import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LogoMark } from "@/components/brand/logo";
import { Markdown } from "@/components/shared/markdown";
import { getPost } from "@/features/posts/queries";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getPost(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await load((await params).slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", publishedTime: post.published_at ?? undefined },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await load((await params).slug);

  return (
    <article className="container-page content-y max-w-3xl">
      <Link href="/artikel" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 py-1 text-sm">
        <ArrowLeft className="size-4" /> Semua artikel
      </Link>
      <header className="mt-8 border-b pb-8">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link key={t} href={`/artikel?tag=${t}`} className="text-brand inline-block py-1 font-mono text-xs font-medium hover:underline">
              #{t}
            </Link>
          ))}
        </div>
        <h1 className="text-title-1 mt-3">{post.title}</h1>
        <p className="text-lead text-muted-foreground mt-4">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span className="bg-navy-900 grid size-9 place-items-center rounded-full">
            <LogoMark className="size-5 text-white" />
          </span>
          <div>
            <p className="font-semibold">{post.author?.full_name ?? "Tim Yasun Studio"}</p>
            <p className="text-muted-foreground text-xs">
              {formatDate(post.published_at)} · {post.reading_minutes} menit baca
            </p>
          </div>
        </div>
      </header>
      <div className="mt-10">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  );
}
