import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const registerHref = next ? `/daftar?next=${encodeURIComponent(next)}` : "/daftar";
  return (
    <AuthShell
      title="Selamat datang kembali"
      description="Masuk untuk melanjutkan belajar di Yasun Studio."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={registerHref} className="text-brand font-semibold hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
