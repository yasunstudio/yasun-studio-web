import type { MetadataRoute } from "next";

import { getCourses } from "@/features/courses/queries";
import { getPosts } from "@/features/posts/queries";
import { emptyPage, safe } from "@/lib/api/client";
import type { CourseListItem, Page, PostListItem } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [courses, posts] = await Promise.all([
    safe(getCourses({ size: 100 }), emptyPage as Page<CourseListItem>),
    safe(getPosts({ size: 100 }), emptyPage as Page<PostListItem>),
  ]);
  const staticRoutes = ["", "/kelas", "/artikel", "/tentang", "/kontak"].map((p) => ({
    url: `${site}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...staticRoutes,
    ...courses.items.map((c) => ({ url: `${site}/kelas/${c.slug}`, lastModified: c.created_at })),
    ...posts.items.map((p) => ({ url: `${site}/artikel/${p.slug}`, lastModified: p.published_at ?? p.created_at })),
  ];
}
