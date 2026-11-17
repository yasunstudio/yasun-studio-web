"use client";

import { useActionState } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitContact } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, {});
  const e = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed p-8 text-center">
        <span className="bg-yellow-brand mb-4 block size-6 rounded-md" />
        <h3 className="text-heading">Pesan terkirim!</h3>
        <p className="text-muted-foreground mt-1 text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <ActionForm action={action} pending={pending} className="grid gap-6" noValidate>
      <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nama" name="name" error={e.name}>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={!!e.name} />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!e.email} />
        </Field>
      </div>
      <Field label="Subjek" name="subject" error={e.subject}>
        <Input id="subject" name="subject" required aria-invalid={!!e.subject} />
      </Field>
      <Field label="Pesan" name="message" error={e.message}>
        <Textarea id="message" name="message" rows={6} required aria-invalid={!!e.message} />
      </Field>
      <SubmitButton className="w-full sm:w-auto sm:justify-self-start">Kirim Pesan</SubmitButton>
    </ActionForm>
  );
}
