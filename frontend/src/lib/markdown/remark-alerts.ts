import type { Blockquote, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

export const ALERT_KINDS = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/;

/**
 * GitHub-style alerts:
 *   > [!TIP]
 *   > Body…
 * become <aside data-alert="tip"> so the renderer can style them as callouts.
 */
export function remarkAlerts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const first = node.children[0] as Paragraph | undefined;
      const text = first?.type === "paragraph" ? (first.children[0] as Text | undefined) : undefined;
      if (text?.type !== "text") return;
      const match = MARKER.exec(text.value);
      if (!match) return;

      text.value = text.value.slice(match[0].length).replace(/^\n/, "");
      if (!text.value) first!.children.shift();
      if (first!.children.length === 0) node.children.shift();

      node.data = {
        ...node.data,
        hName: "aside",
        hProperties: { dataAlert: match[1]!.toLowerCase() },
      };
    });
  };
}
