"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyButton({ text, label = "Salin kode" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground h-7 gap-2 px-2 text-xs"
      aria-label={label}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="text-success size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Tersalin" : "Salin"}
    </Button>
  );
}
