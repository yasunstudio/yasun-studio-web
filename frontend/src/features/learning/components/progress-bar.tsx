import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  label = "Progres belajar",
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", v === 100 ? "bg-success" : "bg-cyan-brand")}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
