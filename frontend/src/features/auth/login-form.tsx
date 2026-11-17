"use client";

import { useActionState } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Input } from "@/components/ui/input";

import { login } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {});
  const e = state.fieldErrors ?? {};
  return (
    <ActionForm action={action} pending={pending} className="grid gap-6">
      <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Kata sandi" name="password" error={e.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton className="mt-1 h-11 w-full">Masuk</SubmitButton>
    </ActionForm>
  );
}
