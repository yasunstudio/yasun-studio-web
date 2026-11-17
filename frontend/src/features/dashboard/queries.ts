import "server-only";

import { api } from "@/lib/api/client";
import type { DashboardStats } from "@/lib/api/types";

export function getDashboardStats() {
  return api<DashboardStats>("/admin/dashboard/stats", { auth: true });
}
