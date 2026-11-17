import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/features/contact/contact-form";
import { PageHero } from "@/features/site/page-hero";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi tim Yasun Studio untuk pertanyaan kelas, kerja sama, atau saran.",
};

const CHANNELS = [
  { icon: Mail, title: "Email", value: "halo@yasunstudio.com" },
  { icon: MessageCircle, title: "Komunitas", value: "Diskusi bersama sesama pelajar" },
  { icon: MapPin, title: "Lokasi", value: "Indonesia · Online" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontak"
        title="Ada yang ingin ditanyakan?"
        description="Kirim pesan, tim kami akan membalas dalam 1×24 jam kerja."
      />
      <section className="container-page content-y grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="grid content-start gap-4">
          {CHANNELS.map((c) => (
            <div key={c.title} className="bg-card flex items-start gap-4 rounded-xl border p-6">
              <span className="bg-accent text-brand grid size-10 shrink-0 place-items-center rounded-xl">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-muted-foreground text-sm">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl border p-6 sm:p-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
