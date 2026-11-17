import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/features/auth/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Yasun Studio gratis dan mulai belajar coding & AI.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  return (
    <AuthShell
      title="Buat akun gratis"
      description="Satu akun untuk semua kelas — progresmu tersimpan otomatis."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href={loginHref} className="text-brand font-semibold hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
