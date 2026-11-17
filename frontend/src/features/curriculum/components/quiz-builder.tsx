"use client";

import { CheckCircle2, Circle, Plus, Square, SquareCheckBig, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { QuizQuestion, QuizSpec } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const LETTERS = "abcdef";

const blankQuestion = (n: number): QuizQuestion => ({
  id: `q${n}`,
  prompt: "",
  multiple: false,
  options: [
    { id: "a", text: "" },
    { id: "b", text: "" },
  ],
  answer: ["a"],
  explanation: "",
});

/**
 * Visual quiz editor. Serialises to a hidden `quiz` field (JSON) validated by
 * the server action (zod) and again by the API (Pydantic).
 */
export function QuizBuilder({ initial, error }: { initial: QuizSpec | null; error?: string }) {
  const [passScore, setPassScore] = useState(initial?.pass_score ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial?.questions ?? [blankQuestion(1)]);

  const patch = (i: number, p: Partial<QuizQuestion>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...p } : q)));

  const toggleAnswer = (i: number, oid: string) => {
    const q = questions[i]!;
    if (!q.multiple) return patch(i, { answer: [oid] });
    const next = q.answer.includes(oid) ? q.answer.filter((x) => x !== oid) : [...q.answer, oid];
    patch(i, { answer: next.length ? next : q.answer });
  };

  const addOption = (i: number) => {
    const q = questions[i]!;
    if (q.options.length >= 6) return;
    patch(i, { options: [...q.options, { id: LETTERS[q.options.length]!, text: "" }] });
  };

  const removeOption = (i: number, oid: string) => {
    const q = questions[i]!;
    if (q.options.length <= 2) return;
    // Re-letter options so ids stay a, b, c… and remap the answer.
    const kept = q.options.filter((o) => o.id !== oid);
    const remap = new Map(kept.map((o, idx) => [o.id, LETTERS[idx]!]));
    const answer = q.answer.filter((a) => remap.has(a)).map((a) => remap.get(a)!);
    patch(i, {
      options: kept.map((o, idx) => ({ ...o, id: LETTERS[idx]! })),
      answer: answer.length ? answer : ["a"],
    });
  };

  const payload: QuizSpec = {
    pass_score: passScore,
    questions: questions.map((q, i) => ({ ...q, id: `q${i + 1}` })),
  };

  return (
    <div className="grid gap-6">
      <input type="hidden" name="quiz" value={JSON.stringify(payload)} />
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <div className="grid max-w-xs gap-2">
        <Label htmlFor="pass_score">Nilai minimum lulus</Label>
        <Input
          id="pass_score"
          type="number"
          min={0}
          max={100}
          value={passScore}
          onChange={(e) => setPassScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
        />
      </div>

      <ol className="grid gap-4">
        {questions.map((q, i) => (
          <li key={i} className="rounded-xl border p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">Soal {i + 1}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={q.multiple}
                    onCheckedChange={(v) => patch(i, { multiple: v, answer: v ? q.answer : [q.answer[0] ?? "a"] })}
                    aria-label="Pilihan ganda (lebih dari satu jawaban)"
                  />
                  Banyak jawaban
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus soal ${i + 1}`}
                  disabled={questions.length <= 1}
                  onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <Textarea
                value={q.prompt}
                onChange={(e) => patch(i, { prompt: e.target.value })}
                rows={2}
                placeholder="Tulis pertanyaan (Markdown didukung, mis. `kode`)"
                aria-label={`Pertanyaan soal ${i + 1}`}
              />

              <div className="grid gap-2">
                <p className="text-muted-foreground text-xs">
                  Klik ikon di kiri untuk menandai {q.multiple ? "semua jawaban benar" : "jawaban benar"}.
                </p>
                {q.options.map((o) => {
                  const correct = q.answer.includes(o.id);
                  const Icon = q.multiple ? (correct ? SquareCheckBig : Square) : correct ? CheckCircle2 : Circle;
                  return (
                    <div key={o.id} className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-pressed={correct}
                        aria-label={`Tandai opsi ${o.id.toUpperCase()} sebagai jawaban benar`}
                        onClick={() => toggleAnswer(i, o.id)}
                      >
                        <Icon className={cn(correct ? "text-success" : "text-muted-foreground")} />
                      </Button>
                      <span className="text-muted-foreground w-4 font-mono text-xs uppercase">{o.id}</span>
                      <Input
                        value={o.text}
                        onChange={(e) =>
                          patch(i, { options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })
                        }
                        placeholder={`Opsi ${o.id.toUpperCase()}`}
                        aria-label={`Teks opsi ${o.id.toUpperCase()}`}
                        className={cn(correct && "border-success/50")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus opsi ${o.id.toUpperCase()}`}
                        disabled={q.options.length <= 2}
                        onClick={() => removeOption(i, o.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-self-start"
                  disabled={q.options.length >= 6}
                  onClick={() => addOption(i)}
                >
                  <Plus /> Tambah opsi
                </Button>
              </div>

              <Textarea
                value={q.explanation}
                onChange={(e) => patch(i, { explanation: e.target.value })}
                rows={2}
                placeholder="Pembahasan (ditampilkan setelah pelajar mengirim jawaban)"
                aria-label={`Pembahasan soal ${i + 1}`}
              />
            </div>
          </li>
        ))}
      </ol>

      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        disabled={questions.length >= 30}
        onClick={() => setQuestions((qs) => [...qs, blankQuestion(qs.length + 1)])}
      >
        <Plus /> Tambah soal
      </Button>
    </div>
  );
}
