"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="bg-destructive/10 text-destructive grid size-12 place-items-center rounded-xl">
        <AlertTriangle />
      </span>
      <h2 className="text-heading mt-6">Gagal memuat halaman</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Terjadi kendala saat menghubungi server. Jika sesi Anda berakhir, silakan masuk kembali.
      </p>
      {error.digest && <p className="text-muted-foreground mt-2 font-mono text-xs">ref: {error.digest}</p>}
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={reset}>
          <RotateCcw /> Coba lagi
        </Button>
        <Button asChild>
          <Link href="/login">Masuk kembali</Link>
        </Button>
      </div>
    </div>
  );
}
