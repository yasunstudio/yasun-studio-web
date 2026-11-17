"use client";

import { ArrowRight, CheckCircle2, CircleHelp, Loader2, RotateCcw, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { InlineMarkdown } from "@/components/shared/inline-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssessmentState, PublicQuiz, QuizResult } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import { submitQuiz } from "../actions";

export function QuizPlayer({
  lessonId,
  courseSlug,
  quiz,
  assessment,
  enrolled,
  nextHref,
}: {
  lessonId: string;
  courseSlug: string;
  quiz: PublicQuiz;
  assessment: AssessmentState;
  enrolled: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, start] = useTransition();
  const answered = quiz.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  const byQuestion = new Map(result?.results.map((r) => [r.question_id, r]));

  const choose = (qid: string, oid: string, multiple: boolean) => {
    if (result) return;
    setAnswers((prev) => {
      const current = prev[qid] ?? [];
      const next = multiple ? (current.includes(oid) ? current.filter((x) => x !== oid) : [...current, oid]) : [oid];
      return { ...prev, [qid]: next };
    });
  };

  const submit = () =>
    start(async () => {
      const res = await submitQuiz(lessonId, courseSlug, answers);
      if (!res.ok || !res.result) {
        toast.error(res.message ?? "Gagal mengirim jawaban");
        return;
      }
      setResult(res.result);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (res.result.passed) router.refresh();
    });

  const retry = () => {
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="grid gap-6">
      {/* Summary / result banner */}
      {result ? (
        <div
          role="status"
          className={cn(
            "flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between",
            result.passed ? "border-success/30 bg-success/10" : "border-destructive/30 bg-destructive/5",
          )}
        >
          <div className="flex items-center gap-4">
            {result.passed ? <Trophy className="text-success size-8 shrink-0" /> : <XCircle className="text-destructive size-8 shrink-0" />}
            <div>
              <p className="text-heading">{result.passed ? "Lulus! Kerja bagus 🎉" : "Belum lulus — ayo coba lagi"}</p>
              <p className="text-muted-foreground text-sm">
                Nilai <span className="text-foreground font-semibold">{result.score}</span> · {result.correct_count} dari{" "}
                {result.total} benar · minimum {result.pass_score} · percobaan ke-{result.attempts}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={retry}>
              <RotateCcw /> Coba lagi
            </Button>
            {result.passed && nextHref && (
              <Button asChild>
                <Link href={nextHref}>
                  Materi berikutnya <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border px-6 py-4 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <CircleHelp className="text-brand size-4" /> {quiz.questions.length} soal
          </span>
          <span className="text-muted-foreground">Nilai minimum {quiz.pass_score}</span>
          {assessment.attempts > 0 && (
            <span className="text-muted-foreground">
              {assessment.attempts} percobaan · nilai terbaik {assessment.best_score ?? 0}
            </span>
          )}
          {assessment.passed && (
            <Badge className="bg-success/10 text-success">
              <CheckCircle2 /> Sudah lulus
            </Badge>
          )}
        </div>
      )}

      {/* Questions */}
      <ol className="grid gap-4">
        {quiz.questions.map((q, i) => {
          const r = byQuestion.get(q.id);
          const selected = answers[q.id] ?? [];
          return (
            <li key={q.id}>
              <fieldset
                className={cn(
                  "rounded-xl border p-6",
                  r && (r.correct ? "border-success/40" : "border-destructive/40"),
                )}
              >
                <legend className="sr-only">Soal {i + 1}</legend>
                <div className="flex items-start gap-3">
                  <span className="bg-muted grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold">{i + 1}</span>
                  <div className="grid min-w-0 flex-1 gap-4">
                    <div>
                      <InlineMarkdown className="text-base font-medium">{q.prompt}</InlineMarkdown>
                      {q.multiple && <p className="text-muted-foreground mt-1 text-xs">Pilih semua jawaban yang benar.</p>}
                    </div>
                    <div className="grid gap-2">
                      {q.options.map((o) => {
                        const isSelected = selected.includes(o.id) || (r?.selected.includes(o.id) ?? false);
                        const isAnswer = r?.answer.includes(o.id) ?? false;
                        return (
                          <label
                            key={o.id}
                            className={cn(
                              "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 text-sm transition-colors",
                              !r && (isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/60"),
                              r && "cursor-default",
                              r && isAnswer && "border-success bg-success/10",
                              r && isSelected && !isAnswer && "border-destructive bg-destructive/5",
                            )}
                          >
                            <input
                              type={q.multiple ? "checkbox" : "radio"}
                              name={q.id}
                              value={o.id}
                              checked={isSelected}
                              disabled={!!r || !enrolled}
                              onChange={() => choose(q.id, o.id, q.multiple)}
                              className="accent-primary size-4 shrink-0"
                            />
                            <InlineMarkdown className="flex-1">{o.text}</InlineMarkdown>
                            {r && isAnswer && <CheckCircle2 className="text-success size-4 shrink-0" aria-label="Jawaban benar" />}
                            {r && isSelected && !isAnswer && <XCircle className="text-destructive size-4 shrink-0" aria-label="Pilihanmu salah" />}
                          </label>
                        );
                      })}
                    </div>
                    {r?.explanation && (
                      <div className="bg-muted/60 rounded-lg px-4 py-3 text-sm">
                        <p className="mb-1 font-semibold">Pembahasan</p>
                        <InlineMarkdown className="text-muted-foreground leading-relaxed">{r.explanation}</InlineMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      {!result && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="text-muted-foreground text-sm">
            {enrolled ? `${answered} dari ${quiz.questions.length} soal terjawab` : "Daftar ke kelas ini untuk mengerjakan kuis."}
          </p>
          <Button onClick={submit} disabled={!enrolled || pending || answered < quiz.questions.length}>
            {pending && <Loader2 className="animate-spin" />} Kirim jawaban
          </Button>
        </div>
      )}
    </div>
  );
}
