"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Result = { ok?: boolean; message?: string };

/** Confirm-then-run destructive action. `action` is a bound Server Action. */
export function DeleteButton({ action, label }: { action: () => Promise<Result>; label: string }) {
  const [pending, start] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Hapus ${label}`} disabled={pending}>
          <Trash2 className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus “{label}”?</AlertDialogTitle>
          <AlertDialogDescription>Tindakan ini permanen dan tidak dapat dibatalkan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={() =>
              start(async () => {
                const res = await action();
                if (res.ok) toast.success(res.message ?? "Berhasil dihapus");
                else toast.error(res.message ?? "Gagal menghapus");
              })
            }
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
