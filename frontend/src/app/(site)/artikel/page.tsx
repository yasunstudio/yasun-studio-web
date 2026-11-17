import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { PostCard } from "@/features/posts/components/post-card";
import { getPosts } from "@/features/posts/queries";
import { PageHero } from "@/features/site/page-hero";

export const metadata: Metadata = {
  title: "Artikel",
  description: "Tips, tutorial, dan wawasan seputar coding & AI.",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  await connection();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await getPosts({ page, size: 9, tag: sp.tag });

  return (
    <>
      <PageHero
        eyebrow={sp.tag ? `#${sp.tag}` : "Artikel"}
        title="Catatan belajar dari Yasun Studio"
        description="Tutorial praktis, roadmap karier, dan wawasan terbaru dunia software & AI."
      />
      <section className="container-page content-y">
        {data.items.length === 0 ? (
          <EmptyState icon={Newspaper} title="Belum ada artikel" description="Nantikan tulisan terbaru kami." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
        <div className="mt-10">
          <Pagination page={data.page} pages={data.pages} basePath="/artikel" params={{ tag: sp.tag }} />
        </div>
      </section>
    </>
  );
}
