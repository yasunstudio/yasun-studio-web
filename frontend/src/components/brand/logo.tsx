import { cn } from "@/lib/utils";

/**
 * Yasun Studio brand mark — monogram "Y" built from code brackets `< >`,
 * a split stem, and the yellow "starting point" square.
 *
 * NOTE: this SVG is a faithful vector approximation of docs/info_logo_*.jpeg.
 * Replace the paths with the official vector export when available — every
 * usage in the app goes through this component, so it's a one-file change.
 *
 * Variants (per brand guide "Satu logo, banyak fungsi"):
 *   - "color"  : cyan brackets, navy stem (light bg) / white stem (dark bg)
 *   - "mono"   : single colour (currentColor) for watermarks & print
 */
type LogoMarkProps = {
  className?: string;
  variant?: "color" | "mono";
  title?: string;
};

export function LogoMark({ className, variant = "color", title = "Yasun Studio" }: LogoMarkProps) {
  const cyan = variant === "mono" ? "currentColor" : "var(--brand-cyan-500)";
  const yellow = variant === "mono" ? "currentColor" : "var(--brand-yellow-400)";
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("shrink-0", variant === "color" && "text-navy-900 dark:text-white", className)}
    >
      <title>{title}</title>
      {/* code brackets forming the arms of the Y */}
      <path
        d="M23 9 9.5 20.5 23 32M41 9l13.5 11.5L41 32"
        fill="none"
        stroke={cyan}
        strokeWidth={8.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* split stem: cyan slanted cap + solid stem */}
      <path d="M27 35.5 37 29v5.5l-10 6.5z" fill={cyan} />
      <path
        d="M27 43.5 37 37v18a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"
        fill="currentColor"
      />
      {/* yellow square — titik awal & keberanian mencoba */}
      <rect x="50" y="1.5" width="10" height="10" rx="1.8" fill={yellow} />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  variant?: "color" | "mono" | "inverse";
};

/** Full lockup: mark + "Yasun Studio" wordmark (+ optional tagline). */
export function Logo({ className, markClassName, showTagline = false, variant = "color" }: LogoProps) {
  const inverse = variant === "inverse";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark
        variant={variant === "mono" ? "mono" : "color"}
        className={cn("size-9", inverse && "text-white dark:text-white", markClassName)}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            inverse ? "text-white" : "text-navy-900 dark:text-white",
          )}
        >
          Yasun Studio
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-xs font-medium",
              inverse ? "text-white/70" : "text-muted-foreground",
            )}
          >
            Belajar Coding &amp; AI
          </span>
        )}
      </span>
    </span>
  );
}
