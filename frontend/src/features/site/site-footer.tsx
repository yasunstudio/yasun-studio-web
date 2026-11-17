import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Belajar",
    links: [
      { href: "/kelas", label: "Semua Kelas" },
      { href: "/kelas?level=beginner", label: "Untuk Pemula" },
      { href: "/artikel", label: "Artikel" },
    ],
  },
  {
    title: "Yasun Studio",
    links: [
      { href: "/tentang", label: "Tentang Kami" },
      { href: "/kontak", label: "Kontak" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-canvas relative overflow-hidden text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-page content-y relative">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo variant="inverse" showTagline />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Platform belajar coding &amp; AI berbahasa Indonesia. Materi terstruktur, proyek nyata,
              dan komunitas yang suportif.
            </p>
            <p className="text-heading mt-6">
              Dari nol, mulai <span className="text-yellow-brand">praktik.</span>
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 grid gap-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-1 text-sm text-white/70 transition hover:text-cyan-brand">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Yasun Studio. Hak cipta dilindungi.</p>
          <p className="flex items-center gap-2">
            <span className="bg-yellow-brand inline-block size-2 rounded-sm" /> Dibuat dengan semangat belajar.
          </p>
        </div>
      </div>
    </footer>
  );
}
