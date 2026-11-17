"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type Course, LEVEL_LABEL } from "@/lib/api/types";

import { saveCourse } from "../actions";

export function CourseForm({ course }: { course?: Course }) {
  const [state, action, pending] = useActionState(saveCourse.bind(null, course?.id ?? null), {});
  const e = state.fieldErrors ?? {};

  return (
    <ActionForm action={action} pending={pending} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid content-start gap-6">
        <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi kelas</CardTitle>
            <CardDescription>Judul dan ringkasan tampil di katalog publik.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Field label="Judul" name="title" error={e.title}>
              <Input id="title" name="title" defaultValue={course?.title} required />
            </Field>
            <Field label="Slug" name="slug" error={e.slug} hint="Kosongkan untuk dibuat otomatis dari judul.">
              <Input id="slug" name="slug" defaultValue={course?.slug} className="font-mono text-sm" />
            </Field>
            <Field label="Ringkasan" name="summary" error={e.summary}>
              <Textarea id="summary" name="summary" rows={2} defaultValue={course?.summary} required />
            </Field>
            <Field label="Deskripsi (Markdown)" name="description" error={e.description}>
              <Textarea
                id="description"
                name="description"
                rows={12}
                defaultValue={course?.description}
                className="font-mono text-sm"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Publikasi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ToggleRow name="is_published" label="Terbitkan" hint="Tampil di situs publik" defaultChecked={course?.is_published} />
            <ToggleRow name="is_featured" label="Unggulan" hint="Ditampilkan di beranda" defaultChecked={course?.is_featured} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/admin/kelas">Batal</Link>
              </Button>
              <SubmitButton className="flex-1">Simpan</SubmitButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Field label="Kategori" name="category" error={e.category}>
              <Input id="category" name="category" defaultValue={course?.category} placeholder="mis. Web Development" required />
            </Field>
            <Field label="Level" name="level" error={e.level}>
              <Select name="level" defaultValue={course?.level ?? "beginner"}>
                <SelectTrigger id="level" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <p className="bg-muted text-muted-foreground rounded-lg px-3 py-2.5 text-xs">
              Jumlah materi &amp; durasi dihitung otomatis dari{" "}
              {course ? (
                <Link href={`/admin/kelas/${course.id}/kurikulum`} className="text-brand font-semibold underline underline-offset-4">
                  kurikulum
                </Link>
              ) : (
                "kurikulum (tersedia setelah kelas disimpan)"
              )}
              {course && ` — saat ini ${course.lessons_count} materi, ${course.duration_minutes} menit.`}
            </p>
            <Field label="Harga (IDR)" name="price" error={e.price} hint="0 = Gratis">
              <Input id="price" name="price" type="number" min={0} step={1000} defaultValue={course?.price ?? 0} />
            </Field>
            <Field label="Tag" name="tags" error={e.tags} hint="Pisahkan dengan koma">
              <Input id="tags" name="tags" defaultValue={course?.tags.join(", ")} placeholder="python, dasar" />
            </Field>
            <Field label="URL thumbnail" name="thumbnail_url" error={e.thumbnail_url}>
              <Input id="thumbnail_url" name="thumbnail_url" type="url" defaultValue={course?.thumbnail_url ?? ""} placeholder="https://…" />
            </Field>
          </CardContent>
        </Card>
      </div>
    </ActionForm>
  );
}

function ToggleRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor={name}>{label}</Label>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <Switch id={name} name={name} defaultChecked={defaultChecked} />
    </div>
  );
}
