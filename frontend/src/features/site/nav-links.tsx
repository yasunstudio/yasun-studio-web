"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavLinks({
  items,
  vertical = false,
}: {
  items: readonly { href: string; label: string }[];
  vertical?: boolean;
}) {
  const pathname = usePathname();
  return items.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          vertical && "py-2.5 text-base",
        )}
      >
        {item.label}
        {active && !vertical && (
          <span className="bg-cyan-brand absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full" />
        )}
      </Link>
    );
  });
}
