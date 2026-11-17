"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Post, POST_STATUS_LABEL } from "@/lib/api/types";

import { savePost } from "../actions";

export function PostForm({ post }: { post?: Post }) {
  const [state, action, pending] = useActionState(savePost.bind(null, post?.id ?? null), {});
  const e = state.fieldErrors ?? {};

  return (
    <ActionForm action={action} pending={pending} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-6">
        <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
        <Card>
          <CardContent className="grid gap-6">
            <Field label="Judul" name="title" error={e.title}>
              <Input id="title" name="title" defaultValue={post?.title} required className="text-base font-semibold" />
            </Field>
            <Field label="Ringkasan" name="excerpt" error={e.excerpt}>
              <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt} required />
            </Field>
            <Field label="Konten (Markdown)" name="content" error={e.content}>
              <Textarea
                id="content"
                name="content"
                rows={20}
                defaultValue={post?.content}
                className="font-mono text-sm leading-relaxed"
                placeholder={"## Subjudul\n\nTulis artikel di sini…"}
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
            <Field label="Status" name="status" error={e.status}>
              <Select name="status" defaultValue={post?.status ?? "draft"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POST_STATUS_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Slug" name="slug" error={e.slug} hint="Otomatis dari judul jika kosong">
              <Input id="slug" name="slug" defaultValue={post?.slug} className="font-mono text-sm" />
            </Field>
            <Field label="Tag" name="tags" error={e.tags} hint="Pisahkan dengan koma">
              <Input id="tags" name="tags" defaultValue={post?.tags.join(", ")} />
            </Field>
            <Field label="URL cover" name="cover_url" error={e.cover_url}>
              <Input id="cover_url" name="cover_url" type="url" defaultValue={post?.cover_url ?? ""} placeholder="https://…" />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/admin/artikel">Batal</Link>
              </Button>
              <SubmitButton className="flex-1">Simpan</SubmitButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </ActionForm>
  );
}
