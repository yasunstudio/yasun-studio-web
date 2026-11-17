import rehypeShiki from "@shikijs/rehype";
import type { Element } from "hast";
import { toString } from "hast-util-to-string";
import { Info, Lightbulb, MessageSquareWarning, OctagonAlert, TriangleAlert } from "lucide-react";
import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";

import { remarkAlerts } from "@/lib/markdown/remark-alerts";
import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

const LANG_LABEL: Record<string, string> = {
  py: "Python",
  python: "Python",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  tsx: "TSX",
  bash: "Terminal",
  sh: "Terminal",
  sql: "SQL",
  yaml: "YAML",
  dockerfile: "Dockerfile",
  json: "JSON",
  text: "Teks",
};

const ALERTS = {
  note: { label: "Catatan", icon: Info, tone: "border-brand bg-brand/5 [&_.alert-icon]:text-brand" },
  tip: { label: "Tips", icon: Lightbulb, tone: "border-success bg-success/5 [&_.alert-icon]:text-success" },
  important: { label: "Penting", icon: MessageSquareWarning, tone: "border-primary bg-primary/5 [&_.alert-icon]:text-primary" },
  warning: { label: "Perhatian", icon: TriangleAlert, tone: "border-yellow-brand bg-yellow-brand/10 [&_.alert-icon]:text-foreground" },
  caution: { label: "Hati-hati", icon: OctagonAlert, tone: "border-destructive bg-destructive/5 [&_.alert-icon]:text-destructive" },
} as const;

function languageOf(pre?: Element): string {
  // Shiki may put the language on <pre> (data-language / class) or on the inner <code>.
  const code = pre?.children.find((c): c is Element => c.type === "element" && c.tagName === "code");
  const fromData = (pre?.properties?.dataLanguage ?? code?.properties?.dataLanguage) as string | undefined;
  if (fromData) return fromData;
  // Shiki emits `class` (string) while remark-rehype emits `className` (array).
  const classes = [pre?.properties, code?.properties]
    .flatMap((p) => [p?.className, p?.class])
    .flatMap((c) => (Array.isArray(c) ? c : String(c ?? "").split(" ")))
    .filter(Boolean) as string[];
  return classes.find((c) => c.startsWith("language-"))?.replace("language-", "") ?? "text";
}

/**
 * Rich, safe Markdown (no raw HTML):
 *  - Shiki syntax highlighting with light/dark themes (rendered on the server)
 *  - code blocks with language label + copy button
 *  - GitHub-style alerts (> [!TIP]) rendered as callouts
 */
export async function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand prose-code:before:content-none prose-code:after:content-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 max-w-none",
        className,
      )}
    >
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkAlerts]}
        rehypePlugins={[
          [
            rehypeShiki,
            {
              themes: { light: "github-light", dark: "github-dark-default" },
              defaultColor: false,
              addLanguageClass: true,
              lazy: true,
              fallbackLanguage: "text",
            },
          ],
        ]}
        components={{
          pre: ({ node, children: code, className: preClass, style }) => {
            const lang = languageOf(node);
            return (
              <div className="not-prose bg-code my-6 overflow-hidden rounded-xl border">
                <div className="flex items-center justify-between border-b px-4 py-1">
                  <span className="text-muted-foreground font-mono text-xs">{LANG_LABEL[lang] ?? lang}</span>
                  <CopyButton text={node ? toString(node) : ""} />
                </div>
                {/* Scrollable on small screens → focusable for keyboard users. */}
                <pre tabIndex={0} className={cn(preClass, "overflow-x-auto p-4 text-sm leading-6")} style={style}>
                  {code}
                </pre>
              </div>
            );
          },
          aside: ({ node, children: body }) => {
            const kind = (node?.properties?.dataAlert as keyof typeof ALERTS | undefined) ?? "note";
            const alert = ALERTS[kind] ?? ALERTS.note;
            return (
              <aside role="note" className={cn("not-prose my-6 rounded-lg border-l-4 px-4 py-3 text-sm", alert.tone)}>
                <p className="mb-1 flex items-center gap-2 font-semibold">
                  <alert.icon className="alert-icon size-4" /> {alert.label}
                </p>
                <div className="[&_code]:bg-muted leading-relaxed [&_code]:rounded [&_code]:px-1 [&_p]:my-1">{body}</div>
              </aside>
            );
          },
        }}
      >
        {children}
      </MarkdownAsync>
    </div>
  );
}
