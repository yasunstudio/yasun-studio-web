import { ArrowRight, Braces, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/features/courses/components/course-card";
import { getCourses } from "@/features/courses/queries";
import { PostCard } from "@/features/posts/components/post-card";
import { getPosts } from "@/features/posts/queries";
import { emptyPage, safe } from "@/lib/api/client";
import type { CourseListItem, Page, PostListItem } from "@/lib/api/types";

// Brand pillars — taken directly from "Makna di balik logo".
const PILLARS = [
  {
    icon: Braces,
    title: "Praktik, bukan sekadar teori",
    body: "Tanda kode < > di logo kami adalah janji: setiap materi diakhiri dengan proyek yang bisa kamu jalankan.",
    accent: "bg-cyan-brand text-navy-950",
  },
  {
    icon: Rocket,
    title: "Mulai dari titik nol",
    body: "Kotak kuning melambangkan titik awal dan keberanian mencoba. Tidak perlu latar belakang IT.",
    accent: "bg-yellow-brand text-navy-950",
  },
  {
    icon: ShieldCheck,
    title: "Tepercaya & terbuka",
    body: "Navy & cyan: kurikulum yang terstruktur, transparan, dan terus diperbarui mengikuti industri.",
    accent: "bg-navy-800 text-white",
  },
];

export default async function HomePage() {
  await connection(); // render per request; data itself is cached (Next data cache + Redis)
  const [courses, allCourses, posts] = await Promise.all([
    safe(getCourses({ featured: true, size: 3 }), emptyPage as Page<CourseListItem>),
    safe(getCourses({ size: 1 }), emptyPage as Page<CourseListItem>),
    safe(getPosts({ size: 3 }), emptyPage as Page<PostListItem>),
  ]);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="bg-brand-canvas relative overflow-hidden text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container-page section-y relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="text-yellow-brand size-3.5" /> Belajar Coding &amp; AI berbahasa Indonesia
            </span>
            <h1 className="text-display mt-6">
              Dari nol,
              <br />
              <span className="text-gradient-brand">mulai praktik.</span>
            </h1>
            <p className="text-lead mt-6 max-w-xl text-white/75">
              Kuasai pemrograman dan kecerdasan buatan lewat kelas terstruktur, proyek nyata, dan mentor
              yang peduli. Satu langkah kecil hari ini, satu skill besar esok hari.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-cyan-brand text-navy-950 hover:bg-cyan-brand/90 font-semibold">
                <Link href="/kelas">
                  Jelajahi Kelas <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/tentang">Kenali Yasun Studio</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                ["100%", "Bahasa Indonesia"],
                [`${allCourses.total}`, "Kelas aktif"],
                ["24/7", "Akses materi"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-title-3">{v}</dt>
                  <dd className="mt-1 text-xs text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Code window visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="bg-cyan-brand/25 absolute -inset-10 rounded-full blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#071334]/90 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="size-3 rounded-full bg-white/15" />
                <span className="size-3 rounded-full bg-white/15" />
                <span className="bg-yellow-brand size-3 rounded-sm" />
                <span className="ml-3 font-mono text-xs text-white/50">belajar.py</span>
              </div>
              <pre
                tabIndex={0}
                aria-label="Contoh kode Python"
                className="overflow-x-auto p-6 font-mono text-sm leading-7 text-white/85"
              >
                <code>
                  <span className="text-cyan-brand">def</span> <span className="text-yellow-brand">mulai</span>(nama):{"\n"}
                  {"    "}langkah = [<span className="text-emerald-300">&quot;nol&quot;</span>, <span className="text-emerald-300">&quot;praktik&quot;</span>, <span className="text-emerald-300">&quot;mahir&quot;</span>]{"\n"}
                  {"    "}<span className="text-cyan-brand">for</span> l <span className="text-cyan-brand">in</span> langkah:{"\n"}
                  {"        "}<span className="text-cyan-brand">yield</span> <span className="text-emerald-300">f&quot;{"{"}nama{"}"} → {"{"}l{"}"}&quot;</span>{"\n\n"}
                  <span className="text-white/40"># Yasun Studio · Belajar Coding &amp; AI</span>{"\n"}
                  <span className="text-cyan-brand">for</span> s <span className="text-cyan-brand">in</span> <span className="text-yellow-brand">mulai</span>(<span className="text-emerald-300">&quot;kamu&quot;</span>):{"\n"}
                  {"    "}print(s)
                </code>
              </pre>
              <div className="absolute right-5 bottom-5 opacity-90">
                <LogoMark className="size-14 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Pillars */}
      <section className="container-page section-y">
        <SectionTitle eyebrow="Kenapa Yasun Studio" title="Satu logo, satu filosofi belajar" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-card rounded-xl border p-6">
              <div className={`grid size-11 place-items-center rounded-xl ${p.accent}`}>
                <p.icon className="size-5" />
              </div>
              <h3 className="text-heading mt-6">{p.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Courses */}
      {courses.items.length > 0 && (
        <section className="bg-muted/50 border-y">
          <div className="container-page section-y">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Kelas unggulan" title="Mulai perjalananmu di sini" align="left" />
              <Button asChild variant="outline">
                <Link href="/kelas">
                  Lihat semua <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.items.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------- Posts */}
      {posts.items.length > 0 && (
        <section className="container-page section-y">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Artikel terbaru" title="Wawasan untuk developer pemula" align="left" />
            <Button asChild variant="ghost">
              <Link href="/artikel">
                Semua artikel <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- CTA */}
      <section className="container-page pb-16 lg:pb-24">
        <div className="bg-brand-canvas relative overflow-hidden rounded-xl p-8 text-white sm:p-12">
          <div className="bg-grid absolute inset-0 opacity-70" />
          <span className="bg-yellow-brand absolute top-8 right-10 size-6 rounded-md" />
          <span className="bg-cyan-brand absolute top-14 right-[4.5rem] size-6 rounded-md" />
          <div className="relative max-w-2xl">
            <h2 className="text-title-2">Siap menulis baris kode pertamamu?</h2>
            <p className="mt-4 text-white/75">
              Bergabung dan mulai dari kelas gratis. Tidak perlu pengalaman — cukup rasa ingin tahu.
            </p>
            <Button asChild size="lg" className="bg-yellow-brand text-navy-950 hover:bg-yellow-brand/90 mt-8 font-semibold">
              <Link href="/kelas?level=beginner">
                Mulai Gratis <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <p
        className="text-eyebrow text-brand flex items-center gap-2 uppercase data-[c=true]:justify-center"
        data-c={align === "center"}
      >
        <span className="bg-cyan-brand inline-block h-0.5 w-6 rounded-full" /> {eyebrow}
      </p>
      <h2 className="text-title-2 mt-3">{title}</h2>
    </div>
  );
}
