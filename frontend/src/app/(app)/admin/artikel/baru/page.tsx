import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { PostForm } from "@/features/posts/components/post-form";

export const metadata: Metadata = { title: "Tulis Artikel" };

export default function NewPostPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader back={{ href: "/admin/artikel", label: "Artikel" }} title="Tulis Artikel" description="Konten ditulis dalam format Markdown." />
      <PostForm />
    </div>
  );
}
