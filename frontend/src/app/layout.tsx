import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

// Plus Jakarta Sans: geometric, bold-friendly — matches the wordmark's character.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yasun Studio — Belajar Coding & AI",
    template: "%s · Yasun Studio",
  },
  description:
    "Yasun Studio: tempat belajar coding dan AI dari nol hingga siap kerja. Dari nol, mulai praktik.",
  applicationName: "Yasun Studio",
  keywords: ["belajar coding", "belajar AI", "kursus programming", "Python", "Next.js", "FastAPI"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Yasun Studio",
    title: "Yasun Studio — Belajar Coding & AI",
    description: "Dari nol, mulai praktik.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050f2a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
