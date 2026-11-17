import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Logo, LogoMark } from "@/components/brand/logo";

const BENEFITS = [
  "Kelas gratis untuk memulai dari nol",
  "Progres belajar tersimpan otomatis",
  "Materi praktik di setiap bab",
];

/** Split-screen layout shared by /login and /daftar. */
export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="bg-brand-canvas relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <div className="bg-grid absolute inset-0" />
        <Link href="/" className="relative">
          <Logo variant="inverse" showTagline />
        </Link>
        <div className="relative my-auto">
          <LogoMark className="mb-10 size-24 text-white" />
          <h2 className="text-title-1">
            Dari nol,
            <br />
            <span className="text-gradient-brand">mulai praktik.</span>
          </h2>
          <ul className="mt-8 grid gap-3 text-white/80">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle2 className="text-cyan-brand size-5" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <span className="bg-yellow-brand absolute top-12 right-12 size-5 rounded-sm" />
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <h1 className="text-title-3 mt-8 lg:mt-0">{title}</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
          <div className="mt-8">{children}</div>
          <div className="text-muted-foreground mt-8 text-center text-sm">{footer}</div>
        </div>
      </div>
    </div>
  );
}
