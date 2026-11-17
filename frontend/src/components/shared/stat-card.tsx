import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  navy: "bg-navy-800 text-white",
  cyan: "bg-cyan-brand text-navy-950",
  yellow: "bg-yellow-brand text-navy-950",
  muted: "bg-muted text-foreground",
} as const;

/** KPI tile shared by the admin dashboard and the learner dashboard. */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "muted",
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  href?: string;
}) {
  const card = (
    <Card className={cn("h-full", href && "transition group-hover:shadow-md")}>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="mt-2 text-metric">{value}</p>
          {sub && <p className="text-muted-foreground mt-1 text-xs">{sub}</p>}
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", TONES[tone])}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="group">
      {card}
    </Link>
  ) : (
    card
  );
}
