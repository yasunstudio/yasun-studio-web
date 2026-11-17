import type { Metadata } from "next";

import { Logo, LogoMark } from "@/components/brand/logo";
import { PageHero } from "@/features/site/page-hero";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Kenali Yasun Studio dan makna di balik logo kami.",
};

const MEANINGS = [
  {
    visual: <LogoMark className="size-14" />,
    title: "Monogram Y",
    body: "Cabang dan batang membentuk inisial Yasun — fondasi yang kokoh untuk tumbuh bercabang.",
  },
  {
    visual: <span className="text-brand font-mono text-4xl font-extrabold">{"< >"}</span>,
    title: "Tanda kode",
    body: "Belajar dan praktik pemrograman adalah inti dari semua yang kami lakukan.",
  },
  {
    visual: <span className="bg-yellow-brand block size-12 rounded-lg" />,
    title: "Kotak kuning",
    body: "Titik awal dan keberanian mencoba. Setiap ahli pernah menjadi pemula.",
  },
  {
    visual: (
      <span className="flex -space-x-3">
        <span className="bg-cyan-brand block size-12 rounded-full" />
        <span className="bg-navy-900 block size-12 rounded-full ring-2 ring-white dark:ring-white/20" />
      </span>
    ),
    title: "Navy & cyan",
    body: "Tepercaya, terbuka, dan eksploratif — karakter yang kami tanamkan pada setiap pelajar.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Tentang kami"
        title="Kenali Yasun Studio"
        description="Kami percaya siapa pun bisa belajar coding & AI — asal berani memulai dan konsisten berpraktik."
      />

      <section className="container-page content-y">
        <div className="bg-card mx-auto flex max-w-3xl flex-col items-center rounded-xl border p-8 text-center shadow-sm">
          <Logo showTagline markClassName="size-16" className="[&>span>span:first-child]:text-3xl" />
        </div>

        <h2 className="text-title-2 mt-16 flex items-center gap-3">
          <span className="bg-cyan-brand inline-block h-0.5 w-10 rounded-full" /> Makna di balik <span className="text-brand">logo</span>
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {MEANINGS.map((m) => (
            <div key={m.title} className="bg-card flex items-center gap-6 rounded-xl border p-6">
              <div aria-hidden className="grid w-20 shrink-0 place-items-center">
                {m.visual}
              </div>
              <div className="border-l pl-6">
                <h3 className="text-heading">{m.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{m.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-title-2 mt-16 text-center">
          Dari nol, mulai <span className="bg-yellow-brand text-navy-950 rounded-md px-2">praktik.</span>
        </p>
      </section>
    </>
  );
}
