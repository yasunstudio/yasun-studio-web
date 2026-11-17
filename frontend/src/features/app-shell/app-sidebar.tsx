"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo, LogoMark } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/api/types";

import { NAV_GROUPS, type NavItem } from "./navigation";

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({ role, unread }: { role: UserRole; unread: number }) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.filter((g) => g.roles.includes(role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border h-16 justify-center border-b px-3">
        <Link href={role === "member" ? "/belajar" : "/admin"} className="flex items-center overflow-hidden">
          <span className="group-data-[collapsible=icon]:hidden">
            <Logo variant="inverse" markClassName="size-8" />
          </span>
          <LogoMark className="hidden size-8 text-white group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/70">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item)}
                      tooltip={item.label}
                      className="data-[active=true]:bg-sidebar-primary/15 data-[active=true]:text-sidebar-primary h-10"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge === "messages" && unread > 0 && (
                      <SidebarMenuBadge className="bg-yellow-brand text-navy-950 rounded-md font-bold">
                        {unread}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Situs publik">
              <Link href="/">
                <ExternalLink />
                <span>Situs publik</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
