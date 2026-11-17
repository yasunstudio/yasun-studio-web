import {
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  Newspaper,
  UserRound,
  Users,
  Library,
} from "lucide-react";

import type { UserRole } from "@/lib/api/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Active only on exact match (for section roots like /admin). */
  exact?: boolean;
  badge?: "messages";
};

export type NavGroup = { label: string; items: NavItem[]; roles: UserRole[] };

/**
 * Single source of truth for the app shell navigation.
 * Every signed-in user gets "Belajar"; staff additionally get the admin groups.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Belajar",
    roles: ["member", "editor", "admin"],
    items: [
      { href: "/belajar", label: "Kelas Saya", icon: Library },
      { href: "/kelas", label: "Jelajahi Kelas", icon: Compass },
      { href: "/akun", label: "Akun", icon: UserRound },
    ],
  },
  {
    label: "Admin",
    roles: ["editor", "admin"],
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Konten",
    roles: ["editor", "admin"],
    items: [
      { href: "/admin/kelas", label: "Kelas", icon: BookOpen },
      { href: "/admin/artikel", label: "Artikel", icon: Newspaper },
      { href: "/admin/pesan", label: "Pesan Masuk", icon: Mail, badge: "messages" },
    ],
  },
  {
    label: "Pembelajaran",
    roles: ["editor", "admin"],
    items: [{ href: "/admin/pelajar", label: "Pelajar", icon: GraduationCap }],
  },
  {
    label: "Sistem",
    roles: ["admin"],
    items: [{ href: "/admin/pengguna", label: "Pengguna", icon: Users }],
  },
];

/** Human labels for URL segments, used by the topbar breadcrumb. */
export const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  belajar: "Kelas Saya",
  akun: "Akun",
  kelas: "Kelas",
  artikel: "Artikel",
  pesan: "Pesan Masuk",
  pelajar: "Pelajar",
  pengguna: "Pengguna",
  kurikulum: "Kurikulum",
  materi: "Materi",
  baru: "Baru",
};
