"use client";

import { useActionState } from "react";

import { ActionForm, FormAlert, SubmitButton } from "@/components/shared/form-controls";

import { enrollCourse } from "../actions";

export function EnrollButton({ slug, label = "Mulai Belajar Gratis" }: { slug: string; label?: string }) {
  const [state, action, pending] = useActionState(enrollCourse.bind(null, slug), {});
  return (
    <ActionForm action={action} pending={pending} className="grid gap-3">
      <SubmitButton className="h-11 w-full">{label}</SubmitButton>
      <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
    </ActionForm>
  );
}
