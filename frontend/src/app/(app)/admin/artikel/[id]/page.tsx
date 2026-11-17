import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { PostForm } from "@/features/posts/components/post-form";
import { getAdminPost } from "@/features/posts/queries";
import { ApiError } from "@/lib/api/client";

export const metadata: Metadata = { title: "Ubah Artikel" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getAdminPost(id).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  });
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader back={{ href: "/admin/artikel", label: "Artikel" }} title="Ubah Artikel" description={post.title} />
      <PostForm post={post} />
    </div>
  );
}
