"use client";

import { ArrowDown, ArrowUp, Check, Code2, Eye, FileText, ListChecks, Pencil, PlayCircle, Plus, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { DeleteButton } from "@/components/admin/delete-button";
import { ActionForm, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KIND_LABEL, type ModuleOutline } from "@/lib/api/types";
import { formatDuration } from "@/lib/utils";

import { addModule, deleteLesson, deleteModule, renameModule, reorderCurriculum } from "../actions";

type Order = { id: string; lesson_ids: string[] }[];

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function CurriculumEditor({ courseId, modules }: { courseId: string; modules: ModuleOutline[] }) {
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(modules);

  const persist = (next: ModuleOutline[]) =>
    start(async () => {
      setOptimistic(next);
      const order: Order = next.map((m) => ({ id: m.id, lesson_ids: m.lessons.map((l) => l.id) }));
      const res = await reorderCurriculum(courseId, order);
      if (!res.ok) toast.error(res.message ?? "Gagal menyimpan urutan");
    });

  const moveModule = (i: number, dir: -1 | 1) => persist(move(optimistic, i, i + dir));

  const moveLesson = (mi: number, li: number, dir: -1 | 1) => {
    const mod = optimistic[mi]!;
    const target = li + dir;
    let next: ModuleOutline[];
    if (target >= 0 && target < mod.lessons.length) {
      next = optimistic.map((m, i) => (i === mi ? { ...m, lessons: move(m.lessons, li, target) } : m));
    } else {
      // Crossing a chapter boundary: move into the adjacent module (end or start).
      const adj = mi + dir;
      if (adj < 0 || adj >= optimistic.length) return;
      const lesson = mod.lessons[li]!;
      next = optimistic.map((m, i) => {
        if (i === mi) return { ...m, lessons: m.lessons.filter((_, j) => j !== li) };
        if (i === adj) return { ...m, lessons: dir === 1 ? [lesson, ...m.lessons] : [...m.lessons, lesson] };
        return m;
      });
    }
    persist(next);
  };

  const totalLessons = optimistic.reduce((t, m) => t + m.lessons.length, 0);
  const isFirstLesson = (mi: number, li: number) => mi === 0 && li === 0;
  const isLastLesson = (mi: number, li: number) =>
    mi === optimistic.length - 1 && li === optimistic[mi]!.lessons.length - 1;

  return (
    <div className="grid gap-4">
      {optimistic.length === 0 && (
        <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
          Belum ada bab. Mulai dengan menambahkan bab pertama di bawah.
        </p>
      )}

      {optimistic.map((m, mi) => (
        <Card key={m.id} className="gap-0 overflow-hidden py-0">
          <div className="bg-muted/50 flex items-center gap-2 border-b px-4 py-3">
            <span className="text-brand font-mono text-xs font-bold">{String(mi + 1).padStart(2, "0")}</span>
            <ModuleTitle courseId={courseId} moduleId={m.id} title={m.title} />
            <span className="text-muted-foreground ml-auto hidden text-xs sm:inline">
              {m.lessons.length} materi · {formatDuration(m.lessons.reduce((t, l) => t + l.duration_minutes, 0))}
            </span>
            <IconBtn label="Naikkan bab" disabled={mi === 0} onClick={() => moveModule(mi, -1)}>
              <ArrowUp />
            </IconBtn>
            <IconBtn label="Turunkan bab" disabled={mi === optimistic.length - 1} onClick={() => moveModule(mi, 1)}>
              <ArrowDown />
            </IconBtn>
            <DeleteButton action={deleteModule.bind(null, courseId, m.id)} label={m.title} />
          </div>

          <ul className="divide-y">
            {m.lessons.map((l, li) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                {(() => {
                  const Icon = { video: PlayCircle, article: FileText, quiz: ListChecks, exercise: Code2 }[l.kind];
                  return <Icon className="text-muted-foreground size-4 shrink-0" aria-label={KIND_LABEL[l.kind]} />;
                })()}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <p className="text-muted-foreground font-mono text-xs">/{l.slug}</p>
                </div>
                {l.is_preview && (
                  <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
                    <Eye /> Pratinjau
                  </Badge>
                )}
                <span className="text-muted-foreground hidden w-16 text-right text-xs tabular-nums sm:block">
                  {formatDuration(l.duration_minutes)}
                </span>
                <IconBtn label="Naikkan materi" disabled={isFirstLesson(mi, li)} onClick={() => moveLesson(mi, li, -1)}>
                  <ArrowUp />
                </IconBtn>
                <IconBtn label="Turunkan materi" disabled={isLastLesson(mi, li)} onClick={() => moveLesson(mi, li, 1)}>
                  <ArrowDown />
                </IconBtn>
                <Button asChild variant="ghost" size="icon" aria-label={`Ubah ${l.title}`}>
                  <Link href={`/admin/kelas/${courseId}/kurikulum/materi/${l.id}`}>
                    <Pencil />
                  </Link>
                </Button>
                <DeleteButton action={deleteLesson.bind(null, courseId, l.id)} label={l.title} />
              </li>
            ))}
            <li className="px-4 py-2">
              <Button asChild variant="ghost" size="sm" className="text-brand">
                <Link href={`/admin/kelas/${courseId}/kurikulum/materi/baru?bab=${m.id}`}>
                  <Plus /> Tambah materi
                </Link>
              </Button>
            </li>
          </ul>
        </Card>
      ))}

      <AddModuleForm courseId={courseId} />
      <p className="text-muted-foreground text-xs">
        {optimistic.length} bab · {totalLessons} materi. Urutan tersimpan otomatis; materi bisa dipindah antarbab
        dengan tombol panah.
      </p>
    </div>
  );
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

function ModuleTitle({ courseId, moduleId, title }: { courseId: string; moduleId: string; title: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex min-w-0 items-center gap-2 text-left font-semibold"
        title="Ubah nama bab"
      >
        <span className="truncate">{title}</span>
        <Pencil className="text-muted-foreground size-3.5 opacity-0 transition group-hover:opacity-100" />
      </button>
    );
  }
  const save = () =>
    start(async () => {
      const res = await renameModule(courseId, moduleId, value);
      if (res.ok) setEditing(false);
      else toast.error(res.message ?? "Gagal menyimpan");
    });
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        autoFocus
        className="bg-background h-8 max-w-sm"
      />
      <IconBtn label="Simpan" disabled={pending} onClick={save}>
        <Check />
      </IconBtn>
      <IconBtn label="Batal" onClick={() => setEditing(false)}>
        <X />
      </IconBtn>
    </div>
  );
}

function AddModuleForm({ courseId }: { courseId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Awaited<ReturnType<typeof addModule>>, fd: FormData) => {
    const res = await addModule(courseId, prev, fd);
    if (res.ok) formRef.current?.reset();
    return res;
  }, {});
  return (
    <ActionForm ref={formRef} action={action} pending={pending} className="grid gap-2">
      <div className="flex gap-2">
        <Input name="title" placeholder="Judul bab baru, mis. “Bab 3 · Proyek Akhir”" className="bg-background" required />
        <SubmitButton>
          <Plus /> Tambah bab
        </SubmitButton>
      </div>
      {!state.ok && <FormAlert message={state.message} errors={state.fieldErrors} />}
    </ActionForm>
  );
}
