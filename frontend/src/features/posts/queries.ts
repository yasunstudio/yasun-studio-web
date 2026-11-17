import "server-only";

import { api } from "@/lib/api/client";
import type { Page, Post, PostListItem } from "@/lib/api/types";

export const POSTS_TAG = "posts";

export function getPosts(query: { page?: number; size?: number; q?: string; tag?: string } = {}) {
  return api<Page<PostListItem>>("/posts", { query, tags: [POSTS_TAG] });
}

export function getPost(slug: string) {
  return api<Post>(`/posts/${encodeURIComponent(slug)}`, { tags: [POSTS_TAG] });
}

// --- admin -----------------------------------------------------------------
export function getAdminPosts(query: { page?: number; q?: string } = {}) {
  return api<Page<PostListItem>>("/admin/posts", { auth: true, query: { size: 20, ...query } });
}

export function getAdminPost(id: string) {
  return api<Post>(`/admin/posts/${id}`, { auth: true });
}
