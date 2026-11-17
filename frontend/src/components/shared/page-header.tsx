import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/** Standard page heading for every screen inside the app shell. */
export function PageHeader({
  title,
  description,
  eyebrow,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="grid gap-3">
      {back && (
        <Link
          href={back.href}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 py-1 text-sm"
        >
          <ArrowLeft className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="text-eyebrow text-brand mb-1">{eyebrow}</p>}
          <h1 className="text-title-3">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
