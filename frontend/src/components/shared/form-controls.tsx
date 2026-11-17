"use client";

import { Loader2 } from "lucide-react";
import { createContext, type ComponentProps, useContext, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  name,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs font-medium">{error}</p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

const PendingContext = createContext(false);

/**
 * Form wired to a `useActionState` action WITHOUT React 19's automatic form reset.
 * (`<form action>` clears every field after the action resolves — including when
 * validation fails — so users would lose everything they typed.)
 */
export function ActionForm({
  action,
  pending = false,
  children,
  ...props
}: Omit<ComponentProps<"form">, "action" | "onSubmit"> & {
  action: (formData: FormData) => void;
  pending?: boolean;
}) {
  const [transitioning, start] = useTransition();
  return (
    <PendingContext value={pending || transitioning}>
      <form
        {...props}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          start(() => action(data));
        }}
      >
        {children}
      </form>
    </PendingContext>
  );
}

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const status = useFormStatus();
  const pending = useContext(PendingContext) || status.pending;
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

const SEGMENT: Record<string, string> = {
  quiz: "Kuis",
  questions: "Soal",
  options: "Opsi",
  exercise: "Latihan",
  title: "Judul",
  summary: "Ringkasan",
  content: "Konten",
  objectives: "Tujuan belajar",
  resources: "Sumber belajar",
  slug: "Slug",
};

function humanize(path: string) {
  return path
    .split(".")
    .map((p) => (/^\d+$/.test(p) ? String(Number(p) + 1) : (SEGMENT[p] ?? p.replace(/_/g, " "))))
    .join(" › ");
}

/** Status banner; on validation errors it also lists every field that needs attention. */
export function FormAlert({ message, ok, errors }: { message?: string; ok?: boolean; errors?: Record<string, string> }) {
  if (!message) return null;
  const list = Object.entries(errors ?? {}).slice(0, 6);
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        ok
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      <p>{message}</p>
      {!ok && list.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {list.map(([field, msg]) => (
            <li key={field}>
              <span className="font-medium">{humanize(field)}</span>: {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
