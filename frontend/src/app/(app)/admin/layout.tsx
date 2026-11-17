import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Admin Yasun Studio" },
};

/** Staff-only guard. The shell itself comes from app/(app)/layout.tsx. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "member") redirect("/belajar");
  return children;
}
