"use client";

import { useActionState } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Input } from "@/components/ui/input";

import { register } from "./actions";

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(register, {});
  const e = state.fieldErrors ?? {};
  return (
    <ActionForm action={action} pending={pending} className="grid gap-6">
      <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Nama lengkap" name="full_name" error={e.full_name}>
        <Input id="full_name" name="full_name" autoComplete="name" required autoFocus />
      </Field>
      <Field label="Email" name="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Kata sandi" name="password" error={e.password} hint="Minimal 8 karakter">
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Ulangi kata sandi" name="password_confirm" error={e.password_confirm}>
        <Input id="password_confirm" name="password_confirm" type="password" autoComplete="new-password" required />
      </Field>
      <SubmitButton className="mt-1 h-11 w-full">Buat Akun Gratis</SubmitButton>
    </ActionForm>
  );
}
