import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-brand-canvas relative grid min-h-dvh place-items-center overflow-hidden px-6 text-white">
      <div className="bg-grid absolute inset-0" />
      <div className="relative text-center">
        <LogoMark className="mx-auto size-20 text-white" />
        <p className="text-cyan-brand mt-8 font-mono text-sm">{"<error code={404} />"}</p>
        <h1 className="text-title-1 mt-3">Halaman tidak ditemukan</h1>
        <p className="mx-auto mt-4 max-w-md text-white/70">
          Mungkin halamannya sudah dipindahkan. Tapi tenang — setiap error adalah bagian dari belajar.
        </p>
        <Button asChild size="lg" className="bg-yellow-brand text-navy-950 hover:bg-yellow-brand/90 mt-8 font-semibold">
          <Link href="/">Kembali ke beranda</Link>
        </Button>
      </div>
    </div>
  );
}
