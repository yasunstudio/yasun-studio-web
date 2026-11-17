import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AccountMenu } from "@/features/account/account-menu";
import { AppSidebar } from "@/features/app-shell/app-sidebar";
import { ShellBreadcrumb } from "@/features/app-shell/shell-breadcrumb";
import { getDashboardStats } from "@/features/dashboard/queries";
import { safe } from "@/lib/api/client";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Yasun Studio", template: "%s · Yasun Studio" },
  robots: { index: false, follow: false },
};

/**
 * One application shell for every signed-in area (learner + admin).
 * Navigation is role-based (see features/app-shell/navigation.ts); pages render
 * inside a single content container so headers, cards and widths line up.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const staff = user.role !== "member";
  const stats = staff ? await safe(getDashboardStats(), null) : null;

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} unread={stats?.messages_unread ?? 0} />
      <SidebarInset className="bg-muted/40">
        <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <ShellBreadcrumb />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <AccountMenu user={user} variant="full" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
