"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ExerciseLanguage } from "@/lib/api/types";

export type RunResult = { stdout: string; stderr: string; ok: boolean; timedOut: boolean; ms: number };
type Status = "idle" | "loading" | "ready" | "running";

const WORKER_URL: Record<ExerciseLanguage, string> = {
  python: "/workers/python-runner.js",
  javascript: "/workers/js-runner.js",
};
// Python's first run downloads the runtime (~10 MB, cached afterwards).
const TIMEOUT_MS: Record<ExerciseLanguage, number> = { python: 10_000, javascript: 5_000 };
const MAX_OUTPUT = 20_000;

/**
 * Runs learner code in an isolated Web Worker. A run that exceeds the timeout
 * (e.g. an infinite loop) terminates the worker; a fresh one is created next time.
 */
export function useCodeRunner(language: ExerciseLanguage) {
  const worker = useRef<Worker | null>(null);
  const readyPromise = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const boot = useCallback(() => {
    if (worker.current && readyPromise.current) return readyPromise.current;
    setStatus("loading");
    const w = new Worker(WORKER_URL[language]);
    worker.current = w;
    readyPromise.current = new Promise<void>((resolve, reject) => {
      const onMsg = (e: MessageEvent) => {
        if (e.data?.type === "ready") {
          w.removeEventListener("message", onMsg);
          setStatus("ready");
          resolve();
        }
      };
      w.addEventListener("message", onMsg);
      w.addEventListener("error", (e) => {
        setStatus("idle");
        reject(new Error(e.message || "Runtime gagal dimuat. Periksa koneksi internet."));
      });
    });
    return readyPromise.current;
  }, [language]);

  const kill = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
    readyPromise.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => kill, [kill]);

  const run = useCallback(
    async (code: string): Promise<RunResult> => {
      const started = performance.now();
      try {
        await boot();
      } catch (err) {
        kill();
        return { stdout: "", stderr: String((err as Error).message), ok: false, timedOut: false, ms: 0 };
      }
      const w = worker.current!;
      setStatus("running");
      const id = crypto.randomUUID();
      let stdout = "";
      let stderr = "";

      return new Promise<RunResult>((resolve) => {
        const finish = (ok: boolean, timedOut = false) => {
          clearTimeout(timer);
          w.removeEventListener("message", onMsg);
          if (timedOut) kill();
          else setStatus("ready");
          resolve({ stdout, stderr, ok, timedOut, ms: Math.round(performance.now() - started) });
        };
        const onMsg = (e: MessageEvent) => {
          const m = e.data;
          if (m?.id !== id) return;
          if (m.type === "stdout" && stdout.length < MAX_OUTPUT) stdout += m.text;
          if (m.type === "stderr" && stderr.length < MAX_OUTPUT) stderr += m.text;
          if (m.type === "done") finish(m.ok);
        };
        const timer = setTimeout(() => {
          stderr += `\nEksekusi dihentikan setelah ${TIMEOUT_MS[language] / 1000} detik (kemungkinan perulangan tanpa akhir).\n`;
          finish(false, true);
        }, TIMEOUT_MS[language]);
        w.addEventListener("message", onMsg);
        w.postMessage({ id, code });
      });
    },
    [boot, kill, language],
  );

  return { run, status, warmUp: boot };
}

/** Same normalisation as the API: trailing spaces and blank edges don't matter. */
export function normalizeOutput(text: string) {
  return text
    .trim()
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n");
}
