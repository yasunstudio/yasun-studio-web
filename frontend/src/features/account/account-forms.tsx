"use client";

import { useActionState, useRef } from "react";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Input } from "@/components/ui/input";

import { changePassword, updateProfile } from "./actions";

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  const e = state.fieldErrors ?? {};
  return (
    <ActionForm action={action} pending={pending} className="grid gap-6">
      <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
      <Field label="Nama lengkap" name="full_name" error={e.full_name}>
        <Input id="full_name" name="full_name" defaultValue={fullName} required />
      </Field>
      <Field label="Email" name="email" hint="Email tidak dapat diubah.">
        <Input id="email" value={email} disabled readOnly />
      </Field>
      <SubmitButton className="justify-self-start">Simpan profil</SubmitButton>
    </ActionForm>
  );
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Parameters<typeof changePassword>[0], fd: FormData) => {
    const res = await changePassword(prev, fd);
    if (res.ok) formRef.current?.reset();
    return res;
  }, {});
  const e = state.fieldErrors ?? {};
  return (
    <ActionForm ref={formRef} action={action} pending={pending} className="grid gap-6">
      <FormAlert message={state.message} ok={state.ok} errors={state.fieldErrors} />
      <Field label="Kata sandi saat ini" name="current_password" error={e.current_password}>
        <Input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Kata sandi baru" name="new_password" error={e.new_password} hint="Minimal 8 karakter">
          <Input id="new_password" name="new_password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Ulangi kata sandi baru" name="new_password_confirm" error={e.new_password_confirm}>
          <Input id="new_password_confirm" name="new_password_confirm" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <SubmitButton className="justify-self-start">Ganti kata sandi</SubmitButton>
    </ActionForm>
  );
}
