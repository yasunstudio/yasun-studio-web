import { Menu } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AccountMenu } from "@/features/account/account-menu";
import { getSessionUser } from "@/lib/auth/session";

import { NavLinks } from "./nav-links";

export const NAV = [
  { href: "/kelas", label: "Kelas" },
  { href: "/artikel", label: "Artikel" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
] as const;

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/65 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Beranda Yasun Studio">
          <Logo markClassName="size-8" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          <NavLinks items={NAV} />
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/belajar">Kelas Saya</Link>
              </Button>
              <AccountMenu user={user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild className="ml-1 hidden sm:inline-flex">
                <Link href="/daftar">Daftar Gratis</Link>
              </Button>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo markClassName="size-7" />
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Navigasi seluler">
                <NavLinks items={NAV} vertical />
              </nav>
              <div className="mt-4 grid gap-2 border-t px-4 pt-4">
                {user ? (
                  <Button asChild>
                    <Link href="/belajar">Kelas Saya</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild>
                      <Link href="/daftar">Daftar Gratis</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/login">Masuk</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
