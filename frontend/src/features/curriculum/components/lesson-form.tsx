"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { KIND_LABEL, type Lesson, type LessonKind } from "@/lib/api/types";

import { saveLesson } from "../actions";
import { QuizBuilder } from "./quiz-builder";

const CONTENT_LABEL: Record<LessonKind, string> = {
  video: "Catatan video (Markdown)",
  article: "Konten (Markdown)",
  quiz: "Pengantar kuis (Markdown)",
  exercise: "Pengantar latihan (Markdown, opsional)",
};

export function LessonForm({
  courseId,
  moduleId,
  lesson,
}: {
  courseId: string;
  moduleId?: string;
  lesson?: Lesson;
}) {
  const target = lesson ? { lessonId: lesson.id } : { moduleId: moduleId! };
  const [state, action, pending] = useActionState(saveLesson.bind(null, courseId, target), {});
  const [kind, setKind] = useState<LessonKind>(lesson?.kind ?? "article");
  const e = state.fieldErrors ?? {};
  const back = `/admin/kelas/${courseId}/kurikulum`;
  const ex = lesson?.exercise;

  return (
    <ActionForm action={action} pending={pending} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-6">
        <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
        <Card>
          <CardContent className="grid gap-6">
            <Field label="Judul materi" name="title" error={e.title}>
              <Input id="title" name="title" defaultValue={lesson?.title} required className="text-base font-semibold" />
            </Field>
            <Field label="Ringkasan" name="summary" error={e.summary} hint="Opsional, maks. 300 karakter">
              <Textarea id="summary" name="summary" rows={2} defaultValue={lesson?.summary} />
            </Field>
            <Field
              label="Tujuan belajar"
              name="objectives"
              error={e.objectives}
              hint="Satu tujuan per baris (maks. 8). Tampil di awal materi."
            >
              <Textarea
                id="objectives"
                name="objectives"
                rows={3}
                defaultValue={lesson?.objectives.join("\n")}
                placeholder={"Menjelaskan …\nMenerapkan …"}
              />
            </Field>
            {kind === "video" && (
              <Field label="URL video" name="video_url" error={e.video_url} hint="YouTube, Vimeo, atau tautan file video (.mp4)">
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  defaultValue={lesson?.video_url ?? ""}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
              </Field>
            )}
            <Field
              label={CONTENT_LABEL[kind]}
              name="content"
              error={e.content}
              hint="Mendukung blok kode berwarna dan callout: > [!TIP], > [!NOTE], > [!WARNING]"
            >
              <Textarea
                id="content"
                name="content"
                rows={kind === "article" ? 18 : 6}
                defaultValue={lesson?.content}
                className="font-mono text-sm leading-relaxed"
              />
            </Field>
          </CardContent>
        </Card>

        {kind === "quiz" && (
          <Card>
            <CardHeader>
              <CardTitle>Soal kuis</CardTitle>
              <CardDescription>Kunci jawaban hanya disimpan di server dan tidak pernah dikirim ke pelajar.</CardDescription>
            </CardHeader>
            <CardContent>
              <QuizBuilder initial={lesson?.quiz ?? null} error={e.quiz} />
            </CardContent>
          </Card>
        )}

        {kind === "exercise" && (
          <Card>
            <CardHeader>
              <CardTitle>Latihan coding</CardTitle>
              <CardDescription>
                Kode pelajar dijalankan di browser; jawaban dinilai dengan mencocokkan output program.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Field label="Bahasa" name="ex_language" error={e["exercise.language"]}>
                <Select name="ex_language" defaultValue={ex?.language ?? "python"}>
                  <SelectTrigger id="ex_language" className="w-full sm:w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Instruksi (Markdown)" name="ex_instructions" error={e["exercise.instructions"]}>
                <Textarea id="ex_instructions" name="ex_instructions" rows={6} defaultValue={ex?.instructions} />
              </Field>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Kode awal" name="ex_starter" error={e["exercise.starter_code"]}>
                  <Textarea id="ex_starter" name="ex_starter" rows={8} defaultValue={ex?.starter_code} className="font-mono text-sm" />
                </Field>
                <Field label="Solusi" name="ex_solution" error={e["exercise.solution"]} hint="Terbuka setelah 2 percobaan atau lulus">
                  <Textarea id="ex_solution" name="ex_solution" rows={8} defaultValue={ex?.solution} className="font-mono text-sm" />
                </Field>
              </div>
              <Field
                label="Output yang diharapkan"
                name="ex_expected"
                error={e["exercise.expected_output"]}
                hint="Harus sama persis dengan output solusi (spasi di akhir baris diabaikan)"
              >
                <Textarea id="ex_expected" name="ex_expected" rows={4} defaultValue={ex?.expected_output} className="font-mono text-sm" />
              </Field>
              <Field label="Petunjuk" name="ex_hints" error={e["exercise.hints"]} hint="Satu petunjuk per baris (maks. 5), dibuka bertahap">
                <Textarea id="ex_hints" name="ex_hints" rows={3} defaultValue={ex?.hints.join("\n")} />
              </Field>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sumber belajar</CardTitle>
            <CardDescription>
              Satu per baris: <code className="bg-muted rounded px-1">Judul | https://url | jenis</code> — jenis: docs,
              article, video, download, tool.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Daftar tautan" name="resources" error={e.resources}>
              <Textarea
                id="resources"
                name="resources"
                rows={3}
                defaultValue={lesson?.resources.map((r) => `${r.title} | ${r.url} | ${r.kind}`).join("\n")}
                placeholder="Dokumentasi resmi Python | https://docs.python.org/3/ | docs"
                className="font-mono text-sm"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
            <CardDescription>Durasi dijumlahkan menjadi durasi kelas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Field label="Jenis" name="kind" error={e.kind}>
              <Select name="kind" value={kind} onValueChange={(v) => setKind(v as LessonKind)}>
                <SelectTrigger id="kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_LABEL) as LessonKind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {KIND_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Durasi (menit)" name="duration_minutes" error={e.duration_minutes}>
              <Input id="duration_minutes" name="duration_minutes" type="number" min={0} defaultValue={lesson?.duration_minutes ?? 10} />
            </Field>
            <Field label="Slug" name="slug" error={e.slug} hint="Otomatis dari judul jika kosong">
              <Input id="slug" name="slug" defaultValue={lesson?.slug} className="font-mono text-sm" />
            </Field>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="is_preview">Pratinjau gratis</Label>
                <p className="text-muted-foreground text-xs">Bisa dibuka sebelum mendaftar kelas</p>
              </div>
              <Switch id="is_preview" name="is_preview" defaultChecked={lesson?.is_preview} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href={back}>Batal</Link>
              </Button>
              <SubmitButton className="flex-1">Simpan</SubmitButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </ActionForm>
  );
}
