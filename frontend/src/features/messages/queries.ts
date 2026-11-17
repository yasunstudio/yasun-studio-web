import "server-only";

import { api } from "@/lib/api/client";
import type { ContactMessage, Page } from "@/lib/api/types";

export function getMessages(query: { page?: number; unread?: boolean } = {}) {
  return api<Page<ContactMessage>>("/admin/messages", { auth: true, query: { size: 20, ...query } });
}
