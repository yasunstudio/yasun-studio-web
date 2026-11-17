"use client";

import { UserPlus } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";

import { ActionForm, Field, FormAlert, SubmitButton } from "@/components/shared/form-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

import { createUser, toggleUserActive } from "./actions";

type ActionState = Awaited<ReturnType<typeof createUser>>;

export function CreateUserSheet() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const res = await createUser(prev, formData);
    if (res.ok) {
      toast.success(res.message);
      setOpen(false);
    }
    return res;
  }, {});
  const e = state.fieldErrors ?? {};

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <UserPlus /> Tambah Pengguna
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pengguna baru</SheetTitle>
          <SheetDescription>Editor dapat mengelola konten; Admin juga mengelola pengguna.</SheetDescription>
        </SheetHeader>
        <ActionForm action={action} pending={pending} className="grid gap-6 px-4">
          {!state.ok && <FormAlert message={state.message} errors={state.fieldErrors} />}
          <Field label="Nama lengkap" name="full_name" error={e.full_name}>
            <Input id="full_name" name="full_name" required />
          </Field>
          <Field label="Email" name="email" error={e.email}>
            <Input id="email" name="email" type="email" required />
          </Field>
          <Field label="Kata sandi" name="password" error={e.password} hint="Minimal 8 karakter">
            <Input id="password" name="password" type="password" required />
          </Field>
          <Field label="Peran" name="role" error={e.role}>
            <Select name="role" defaultValue="editor">
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <SubmitButton>Simpan</SubmitButton>
        </ActionForm>
      </SheetContent>
    </Sheet>
  );
}

export function ActiveSwitch({ id, isActive, disabled }: { id: string; isActive: boolean; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={isActive}
      disabled={disabled || pending}
      aria-label="Status aktif"
      onCheckedChange={(v) =>
        start(async () => {
          const res = await toggleUserActive(id, v);
          if (!res.ok) toast.error(res.message);
        })
      }
    />
  );
}
