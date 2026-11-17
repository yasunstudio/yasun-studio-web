"use client";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import CodeMirror, { EditorView, Prec } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";

import type { ExerciseLanguage } from "@/lib/api/types";

const EXTENSIONS = {
  python: [python()],
  javascript: [javascript()],
} as const;

// Align the editor with the design tokens (same surface as code blocks, AA-contrast gutters).
// Prec.highest: must win over the bundled light/dark themes added by react-codemirror.
const base = Prec.highest(
  EditorView.theme({
  "&": { fontSize: "14px", backgroundColor: "var(--code)" },
  ".cm-content": { fontFamily: "var(--font-jetbrains), ui-monospace, monospace", padding: "12px 0" },
  ".cm-gutters": { border: "none", backgroundColor: "var(--code)", color: "var(--muted-foreground)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--foreground)" },
  // Subtle active-line tint keeps syntax colours (e.g. comments) above 4.5:1.
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--foreground) 4%, transparent)" },
  "&.cm-focused": { outline: "2px solid var(--ring)", outlineOffset: "-2px" },
  }),
);

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  label,
  minHeight = "260px",
}: {
  value: string;
  onChange?: (v: string) => void;
  language: ExerciseLanguage;
  readOnly?: boolean;
  label: string;
  minHeight?: string;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      extensions={[
        ...EXTENSIONS[language],
        base,
        EditorView.lineWrapping,
        // The accessible name must sit on the editable element (role="textbox").
        EditorView.contentAttributes.of({ "aria-label": label }),
      ]}
      readOnly={readOnly}
      editable={!readOnly}
      minHeight={minHeight}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: !readOnly, autocompletion: true, tabSize: 4 }}
    />
  );
}
