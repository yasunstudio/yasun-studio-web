import "server-only";

import { api } from "@/lib/api/client";
import type { Page, User } from "@/lib/api/types";

export function getUsers(query: { page?: number; q?: string } = {}) {
  return api<Page<User>>("/admin/users", { auth: true, query: { size: 20, ...query } });
}
