"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { SEGMENT_LABELS } from "./navigation";

/** Breadcrumb from known URL segments; ids/slugs are skipped (page titles name them). */
export function ShellBreadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts
    .map((seg, i) => ({ label: SEGMENT_LABELS[seg], href: "/" + parts.slice(0, i + 1).join("/") }))
    .filter((c): c is { label: string; href: string } => Boolean(c.label));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, i) => (
          <Fragment key={c.href}>
            {i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
            <BreadcrumbItem className={i < crumbs.length - 1 ? "hidden sm:inline-flex" : undefined}>
              {i === crumbs.length - 1 ? (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={c.href} className="inline-block py-1">
                    {c.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
