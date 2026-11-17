import { GraduationCap, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/actions";
import type { SessionUser } from "@/lib/auth/session";

export function initials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YS"
  );
}

export const ROLE_LABEL = { admin: "Administrator", editor: "Editor", member: "Pelajar" } as const;

/**
 * The one account dropdown used everywhere.
 *   compact → avatar only (public site header)
 *   full    → avatar + name + role (app shell topbar)
 */
export function AccountMenu({ user, variant = "compact" }: { user: SessionUser; variant?: "compact" | "full" }) {
  const staff = user.role === "admin" || user.role === "editor";
  const avatar = (
    <Avatar className="size-8">
      <AvatarFallback className="bg-navy-800 text-xs font-bold text-white">{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "full" ? (
          <Button variant="ghost" className="h-10 gap-2 px-2" aria-label="Menu akun">
            {avatar}
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold">{user.name}</span>
              <span className="text-muted-foreground block text-xs">{ROLE_LABEL[user.role]}</span>
            </span>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu akun">
            {avatar}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="text-muted-foreground text-xs">{ROLE_LABEL[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/belajar">
            <GraduationCap /> Kelas Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/akun">
            <UserRound /> Akun
          </Link>
        </DropdownMenuItem>
        {staff && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard /> Dashboard Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut /> Keluar
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
