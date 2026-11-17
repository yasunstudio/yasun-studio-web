"use client";

import { Check, Loader2, NotebookPen } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Textarea } from "@/components/ui/textarea";

import { saveNote } from "../actions";

type SaveState = "idle" | "saving" | "saved" | "error";

/** Private per-lesson notes with debounced autosave. */
export function LessonNotes({ lessonId, initial }: { lessonId: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");
  const lastSaved = useRef(initial);

  useEffect(() => {
    if (value === lastSaved.current) return;
    const t = setTimeout(async () => {
      setState("saving");
      const res = await saveNote(lessonId, value);
      if (res.ok) {
        lastSaved.current = value;
        setState("saved");
      } else setState("error");
    }, 800);
    return () => clearTimeout(t);
  }, [value, lessonId]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={`note-${lessonId}`} className="flex items-center gap-2 text-sm font-semibold">
          <NotebookPen className="text-brand size-4" /> Catatan pribadi
        </label>
        <span className="text-muted-foreground flex items-center gap-1 text-xs" aria-live="polite">
          {state === "saving" && (
            <>
              <Loader2 className="size-3 animate-spin" /> Menyimpan…
            </>
          )}
          {state === "saved" && (
            <>
              <Check className="text-success size-3" /> Tersimpan
            </>
          )}
          {state === "error" && <span className="text-destructive">Gagal menyimpan</span>}
        </span>
      </div>
      <Textarea
        id={`note-${lessonId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        maxLength={10_000}
        placeholder="Tulis poin penting, pertanyaan, atau ide dari materi ini…"
        className="resize-y text-sm"
      />
      <p className="text-muted-foreground text-xs">Hanya kamu yang bisa melihat catatan ini.</p>
    </div>
  );
}
