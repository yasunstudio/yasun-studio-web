"use client";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Lightbulb,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  SendHorizonal,
  Terminal,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssessmentState, PublicExercise } from "@/lib/api/types";
import { normalizeOutput, type RunResult, useCodeRunner } from "@/lib/runner/use-code-runner";
import { cn } from "@/lib/utils";

import { fetchSolution, submitExercise } from "../actions";

// CodeMirror touches `window`; load it only in the browser.
const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-none" />,
});

const LANG = { python: "Python", javascript: "JavaScript" } as const;

export function CodeExercise({
  lessonId,
  courseSlug,
  exercise,
  assessment,
  enrolled,
  nextHref,
}: {
  lessonId: string;
  courseSlug: string;
  exercise: PublicExercise;
  assessment: AssessmentState;
  enrolled: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const draftKey = `ys:exercise:${lessonId}`;
  const [code, setCode] = useState(exercise.starter_code);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [verdict, setVerdict] = useState<"pass" | "fail" | null>(assessment.passed ? "pass" : null);
  const [attempts, setAttempts] = useState(assessment.attempts);
  const [unlocked, setUnlocked] = useState(assessment.solution_unlocked);
  const [solution, setSolution] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [submitting, startSubmit] = useTransition();
  const { run, status } = useCodeRunner(exercise.language);
  const busy = status === "running" || status === "loading" || submitting;

  // Restore the learner's draft (per-browser convenience only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      if (saved) setCode(saved);
    } catch {
      /* storage unavailable */
    }
  }, [draftKey]);

  const update = (v: string) => {
    setCode(v);
    try {
      localStorage.setItem(draftKey, v);
    } catch {
      /* ignore */
    }
  };

  const execute = async () => {
    const res = await run(code);
    setOutput(res);
    return res;
  };

  const check = async () => {
    const res = await execute();
    const local = res.ok && normalizeOutput(res.stdout) === normalizeOutput(exercise.expected_output);
    if (!enrolled) {
      setVerdict(local ? "pass" : "fail");
      return;
    }
    startSubmit(async () => {
      const r = await submitExercise(lessonId, courseSlug, code, res.stdout);
      if (!r.ok || !r.result) {
        toast.error(r.message ?? "Gagal menyimpan hasil");
        return;
      }
      setAttempts(r.result.attempts);
      setUnlocked(r.result.solution_unlocked);
      setVerdict(r.result.passed ? "pass" : "fail");
      if (r.result.passed) {
        toast.success("Latihan lulus! 🎉");
        router.refresh();
      }
    });
  };

  const showSolution = () =>
    startSubmit(async () => {
      const r = await fetchSolution(lessonId);
      if (r.ok && r.solution) setSolution(r.solution);
      else toast.error(r.message ?? "Solusi belum tersedia");
    });

  const reset = () => {
    update(exercise.starter_code);
    setOutput(null);
    setVerdict(null);
  };

  return (
    <div className="grid gap-6">
      {/* Editor */}
      <div className="overflow-hidden rounded-xl border">
        <div className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="bg-yellow-brand size-2 rounded-sm" aria-hidden />
            main.{exercise.language === "python" ? "py" : "js"}
            <Badge variant="secondary">{LANG[exercise.language]}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {attempts > 0 && <span className="text-muted-foreground text-xs">{attempts} percobaan</span>}
            {verdict === "pass" && (
              <Badge className="bg-success/10 text-success">
                <CheckCircle2 /> Lulus
              </Badge>
            )}
          </div>
        </div>
        <CodeEditor value={code} onChange={update} language={exercise.language} label="Editor kode latihan" />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={reset} disabled={busy}>
            <RotateCcw /> Reset
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={execute} disabled={busy}>
              {status === "running" || status === "loading" ? <Loader2 className="animate-spin" /> : <Play />} Jalankan
            </Button>
            <Button onClick={check} disabled={busy}>
              {submitting ? <Loader2 className="animate-spin" /> : <SendHorizonal />} Periksa jawaban
            </Button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-code overflow-hidden rounded-xl border">
          <div className="text-muted-foreground flex items-center justify-between border-b px-4 py-2 text-xs">
            <span className="flex items-center gap-2 font-medium">
              <Terminal className="size-3.5" /> Output programmu
            </span>
            {output && <span>{output.ms} ms</span>}
          </div>
          <pre
            tabIndex={0}
            aria-live="polite"
            className="min-h-32 overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre-wrap"
          >
            {status === "loading" ? (
              <span className="text-muted-foreground">
                Menyiapkan runtime {LANG[exercise.language]}…{exercise.language === "python" && " (pertama kali ±5–10 detik)"}
              </span>
            ) : output ? (
              <>
                {output.stdout}
                {output.stderr && <span className="text-destructive">{output.stderr}</span>}
                {!output.stdout && !output.stderr && <span className="text-muted-foreground">(tidak ada output)</span>}
              </>
            ) : (
              <span className="text-muted-foreground">Tekan “Jalankan” untuk melihat hasil.</span>
            )}
          </pre>
        </div>
        <div className="bg-code overflow-hidden rounded-xl border">
          <div className="text-muted-foreground flex items-center justify-between border-b px-4 py-1 text-xs">
            <span className="font-medium">Output yang diharapkan</span>
            <CopyButton text={exercise.expected_output} label="Salin output yang diharapkan" />
          </div>
          <pre tabIndex={0} className="min-h-32 overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre-wrap">
            {exercise.expected_output}
          </pre>
        </div>
      </div>

      {/* Verdict */}
      {verdict && (
        <div
          role="status"
          className={cn(
            "flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between",
            verdict === "pass" ? "border-success/30 bg-success/10" : "border-destructive/30 bg-destructive/5",
          )}
        >
          <div className="flex items-center gap-4">
            {verdict === "pass" ? (
              <CheckCircle2 className="text-success size-8 shrink-0" />
            ) : (
              <XCircle className="text-destructive size-8 shrink-0" />
            )}
            <div>
              <p className="text-heading">{verdict === "pass" ? "Output sudah sesuai. Mantap!" : "Output belum sesuai"}</p>
              <p className="text-muted-foreground text-sm">
                {verdict === "pass"
                  ? enrolled
                    ? "Latihan tercatat lulus dan materi ini selesai."
                    : "Daftar ke kelas untuk menyimpan progresmu."
                  : "Bandingkan output programmu dengan output yang diharapkan baris per baris."}
              </p>
            </div>
          </div>
          {verdict === "pass" && nextHref && (
            <Button asChild>
              <Link href={nextHref}>
                Materi berikutnya <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Hints & solution */}
      <div className="grid gap-4 md:grid-cols-2">
        {exercise.hints.length > 0 && (
          <div className="rounded-xl border p-6">
            <p className="text-heading flex items-center gap-2">
              <Lightbulb className="text-success size-5" /> Petunjuk
            </p>
            <ol className="mt-4 grid gap-2 text-sm">
              {exercise.hints.slice(0, hintsShown).map((h, i) => (
                <li key={h} className="bg-muted/60 rounded-lg px-4 py-2">
                  <span className="font-semibold">{i + 1}.</span> {h}
                </li>
              ))}
            </ol>
            {hintsShown < exercise.hints.length ? (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setHintsShown((n) => n + 1)}>
                Tampilkan petunjuk {hintsShown + 1} dari {exercise.hints.length}
              </Button>
            ) : (
              <p className="text-muted-foreground mt-4 text-xs">Semua petunjuk sudah ditampilkan.</p>
            )}
          </div>
        )}
        <div className="rounded-xl border p-6">
          <p className="text-heading flex items-center gap-2">
            {unlocked ? <Eye className="text-brand size-5" /> : <Lock className="text-muted-foreground size-5" />} Solusi
          </p>
          {solution ? (
            <div className="mt-4 grid gap-2">
              <div className="overflow-hidden rounded-lg border">
                <CodeEditor value={solution} language={exercise.language} readOnly label="Kode solusi" minHeight="0" />
              </div>
              <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => update(solution)}>
                Salin ke editor
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mt-2 text-sm">
                {unlocked
                  ? "Bandingkan dengan solusi setelah kamu mencoba sendiri."
                  : "Terbuka setelah 2 kali mencoba atau setelah latihan lulus — berusaha dulu ya! 💪"}
              </p>
              <Button variant="outline" size="sm" className="mt-4" disabled={!unlocked || !enrolled || submitting} onClick={showSolution}>
                <Eye /> Lihat solusi
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
