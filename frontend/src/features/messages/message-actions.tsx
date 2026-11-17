"use client";

import { MailCheck, MailOpen } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { setMessageRead } from "./actions";

export function ToggleReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setMessageRead(id, !isRead);
          if (!res.ok) toast.error(res.message);
        })
      }
    >
      {isRead ? <MailOpen /> : <MailCheck />}
      {isRead ? "Tandai belum dibaca" : "Tandai dibaca"}
    </Button>
  );
}
