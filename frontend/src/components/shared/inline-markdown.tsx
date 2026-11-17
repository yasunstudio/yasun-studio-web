import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/** Lightweight, client-safe Markdown for short texts (quiz prompts, explanations). */
export function InlineMarkdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "[&_code]:bg-muted [&_p]:my-0 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_strong]:font-semibold",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
