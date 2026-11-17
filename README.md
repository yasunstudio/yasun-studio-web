# Yasun Studio — Website & Admin Dashboard

> **Belajar Coding & AI** · *Dari nol, mulai praktik.*

Platform web publik + admin dashboard untuk Yasun Studio, dibangun sebagai monorepo yang sepenuhnya berjalan di Docker.

| Layer      | Teknologi                                                                 |
|------------|---------------------------------------------------------------------------|
| Frontend   | **Next.js 16.4** (App Router, RSC, Server Actions, Turbopack) · React 19.3 · TypeScript 6 |
| UI         | **shadcn/ui** (Radix UI `radix-ui` 1.8) · Tailwind CSS 4.3 · lucide-react · sonner |
| Backend    | **FastAPI 0.163** · Python 3.14 · SQLAlchemy 2.1 (async) · Alembic · Pydantic 2 |
| Database   | **PostgreSQL 18.7**                                                        |
| Cache/Sesi | **Redis 8.8** (cache, rate limiting, refresh-token store)                 |
| Gateway    | Nginx 1.31 (reverse proxy, gzip, rate limit)                               |
| Tooling    | uv · pnpm · ruff · mypy · pytest · ESLint 10                               |

---

## Quick start

```bash
cp .env.example .env        # lalu ganti SECRET_KEY: openssl rand -hex 32
make up                     # = docker compose up -d --build
```

| URL                                   | Keterangan                            |
|---------------------------------------|---------------------------------------|
| http://localhost                      | Situs publik (via nginx)              |
| http://localhost/daftar               | Daftar akun pelajar                   |
| http://localhost/belajar              | Area pelajar (Kelas Saya)             |
| http://localhost/admin                | Admin dashboard (staf)                |
| http://localhost/api/v1/docs          | Swagger / OpenAPI (non-production)    |
| http://localhost/health/ready         | Readiness (DB + Redis)                |

Login awal: `FIRST_SUPERUSER_EMAIL` / `FIRST_SUPERUSER_PASSWORD` dari `.env` (default `admin@yasunstudio.com` / `ChangeMe123!` — **segera ganti**).

Saat start, backend otomatis: menunggu DB & Redis → `alembic upgrade head` → seed (idempotent: hanya mengisi data demo bila database masih kosong).

### Data demo

Seed (`backend/scripts/seed/`) membuat dataset lengkap yang deterministik:

| Data | Isi |
|---|---|
| Kelas | 8 terbit (6 gratis, 2 berbayar) + 1 draf, 121 materi: 86 video/bacaan, 28 kuis akhir bab (±90 soal), 7 latihan coding Python/JavaScript |
| Video | Kursus publik freeCodeCamp/Mosh di YouTube, sebagai placeholder sampai video Yasun Studio sendiri tersedia |
| Artikel | 9 (terbit, draf, arsip) dari 3 penulis |
| Pengguna | 1 admin, 2 editor, 24 pelajar (1 nonaktif), tanggal daftar tersebar 0–180 hari |
| Belajar | ±60 pendaftaran kelas dengan progres konsisten (materi selesai berurutan, termasuk kelas tuntas) |
| Pesan | 8 pesan kontak (sebagian belum dibaca) |

**Akun demo** (password hanya untuk dev, jangan dipakai di production):

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@yasunstudio.com` | nilai `FIRST_SUPERUSER_PASSWORD` di `.env` |
| Editor | `dimas@example.com`, `ayu@example.com` | `Editor123!` |
| Pelajar | `siti@example.com` (Python tuntas, JS 58%, Git 33%, AI baru mulai) | `Pelajar123!` |
| Pelajar lain | `budi@example.com`, `rina@example.com`, … | `Pelajar123!` |

Bangun ulang data demo kapan saja dengan `make seed-reset` (ditolak bila `ENVIRONMENT=production`). Set `SEED_SAMPLE_DATA=false` di production agar hanya akun admin yang dibuat.

Port host dev (`DB_HOST_PORT`, `REDIS_HOST_PORT`, `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`) bisa diubah di `.env` bila bentrok.

### Production (Synology NAS + Cloudflare Tunnel)

```
push ke main ─▶ GitHub Actions (CI + build image) ─▶ GHCR ─▶ NAS: sudo ./deploy.sh ─▶ Cloudflare Tunnel ─▶ publik
```

- **CI** (`.github/workflows/ci.yml`): lint, format, test backend (termasuk validasi konten seed), lint/typecheck/build frontend.
- **Release** (`.github/workflows/release.yml`): image `backend`, `frontend`, `gateway` → `ghcr.io/yasunstudio/yasun-studio-*` (tag `latest` + `sha-xxxxxxx`).
- **NAS**: [`deploy/synology/`](deploy/synology/) berisi compose produksi, `deploy.sh`, `backup.sh`, `restore.sh`.
- Panduan langkah demi langkah: **[docs/synology.md](docs/synology.md)** dan **[docs/cloudflare.md](docs/cloudflare.md)**.

Wajib di production: `SECRET_KEY` acak, password DB/Redis kuat (tanpa karakter `$`), `SITE_URL` domain asli, `SEED_SAMPLE_DATA=false`.

---

## Arsitektur

```
                 ┌──────────── nginx :80 ────────────┐
   browser ────▶ │  /api/*, /health → backend:8000   │
                 │  /*              → frontend:3000  │
                 └───────────────────────────────────┘
 frontend (Next.js) ── server-side fetch (jaringan internal) ──▶ backend (FastAPI)
   • RSC & Server Actions                                       • modules/* (router → service → repository)
   • token JWT di cookie httpOnly                               • PostgreSQL 18 (SQLAlchemy async)
   • proxy.ts: guard /admin + auto refresh                      • Redis 8 (cache, rate limit, refresh tokens)
```

### Backend — modular by domain

```
backend/app/
├── core/            config, database, redis, cache, security, exceptions, logging, middleware, rate_limit
├── shared/          Base model + mixin (UUIDv7, timestamps), BaseRepository generik, Page[T]
├── api/             deps (DbSession, CurrentUser, require_roles), health, router v1
└── modules/
    ├── auth/        daftar (pelajar), login, refresh (rotasi, sekali pakai), logout
    ├── users/       RBAC: admin · editor · member
    ├── courses/     katalog kelas (publik + admin CRUD)
    ├── curriculum/  bab & materi, urutan, agregat durasi/jumlah materi otomatis
    ├── enrollments/ pendaftaran kelas, kontrol akses materi, progres belajar
    ├── posts/       artikel Markdown (draf/terbit/arsip)
    ├── contacts/    formulir kontak → kotak masuk admin
    └── dashboard/   statistik ringkas
```
Setiap modul: `models.py` · `schemas.py` · `repository.py` · `service.py` · `router.py`. **Menambah modul:** buat folder baru, daftarkan model di `app/models.py`, include router di `app/api/router.py`, lalu `make migration m="..."`.

Fitur enterprise: error envelope konsisten `{"error":{code,message,details}}`, request-ID + structured logging (JSON di prod), cache Redis ber-namespace dengan invalidasi O(1), rate limit (login, kontak), refresh token yang bisa dicabut, Argon2id, readiness probe, docs dimatikan di production.

### Frontend — feature-sliced

```
frontend/src/
├── app/
│   ├── (site)/      beranda, kelas, artikel, tentang, kontak
│   ├── (auth)/      login, daftar
│   └── (app)/       SATU app shell (sidebar + topbar) untuk semua yang login
│       ├── belajar/ Kelas Saya, belajar/[kelas]/[materi]
│       ├── akun/    profil & keamanan
│       └── admin/   dashboard, kelas (+ kurikulum), artikel, pesan, pelajar, pengguna (guard staf)
├── features/<domain>/   queries.ts (server) · actions.ts (Server Actions) · components/
├── features/app-shell/  sidebar, breadcrumb, navigation.ts (menu per role — satu sumber)
├── components/
│   ├── ui/          shadcn/ui (Radix)
│   ├── brand/       Logo & LogoMark
│   ├── shared/      page-header, stat-card, pagination, markdown, form controls, theme toggle
│   └── admin/       page header, delete dialog, search
├── lib/             api client bertipe, session, utils
└── proxy.ts         guard per role + rotasi token
```
Token tidak pernah menyentuh JavaScript browser: semua panggilan API dilakukan server-side.

---

## Pengalaman pelajar (Fase 1)

| Role | Akses |
|------|-------|
| Tamu | Katalog & detail kelas beserta kurikulum (tanpa isi materi) |
| `member` (pelajar) | Daftar mandiri di `/daftar` · daftar kelas gratis · materi pratinjau · `/belajar` · `/akun` |
| `editor` / `admin` | Semua di atas + `/admin` (admin juga mengelola pengguna) |

- **Kontrol akses materi di server:** isi materi hanya dikirim jika pelajar terdaftar di kelas itu atau materinya `is_preview`.
- **Progres diturunkan, bukan disimpan:** materi selesai ÷ jumlah materi saat ini, jadi tetap akurat saat kurikulum berubah. Kelas otomatis berstatus *tuntas* di 100%.
- **Kelas berbayar** (`price > 0`) mengembalikan `402 payment_required` sampai pembayaran (Fase 2) tersedia.
- `lessons_count` & `duration_minutes` kelas dihitung otomatis dari kurikulum.
- Rate limit memakai `X-Real-IP` dari nginx (tidak bisa dipalsukan klien); Server Actions meneruskannya ke backend.

**Belum termasuk (Fase 2/3):** verifikasi email & lupa kata sandi (butuh layanan email), pembayaran, sertifikat, kuis, ulasan.

---

## Pengalaman belajar interaktif

Setiap materi bisa berupa **video**, **bacaan**, **kuis**, atau **latihan coding**:

| Fitur | Detail |
|---|---|
| Materi kaya | Tujuan belajar di awal, *syntax highlighting* (Shiki, tema terang/gelap) + tombol salin, callout `> [!TIP]` / `[!NOTE]` / `[!WARNING]` / `[!IMPORTANT]` / `[!CAUTION]`, sumber belajar resmi |
| Kuis | Pilihan tunggal/ganda, **dinilai di server** (kunci jawaban tidak pernah dikirim ke browser), pembahasan per soal, nilai minimum lulus, riwayat percobaan |
| Latihan coding | Editor CodeMirror; **Python berjalan di browser via Pyodide (WebAssembly)**, JavaScript di sandbox Web Worker; timeout untuk perulangan tanpa akhir; petunjuk bertahap; solusi terbuka setelah 2 percobaan atau lulus |
| Catatan pribadi | Per materi, tersimpan otomatis |
| Integritas progres | Materi kuis/latihan hanya bisa selesai dengan **lulus**; setiap percobaan tercatat di `lesson_attempts` |
| Admin | Pembuat kuis visual, form latihan (bahasa, kode awal, solusi, output yang diharapkan, petunjuk), tujuan & sumber belajar |

Batasan saat ini: kode latihan dijalankan di browser pelajar dan server memverifikasi *output*-nya. Untuk ujian bersertifikat, rencananya eksekusi dipindah ke sandbox di server (Fase 3).

Konten seed diverifikasi otomatis (`backend/tests/test_seed_content.py`): semua kuis valid terhadap skema, dan setiap solusi latihan **dijalankan** untuk memastikan output-nya cocok (serta kode awalnya belum lulus).

## Pengujian

| Lapisan | Perintah |
|---|---|
| Backend (unit + konten seed) | `make test` |
| Lint & typecheck | `make lint` · `make typecheck` |
| E2E browser + audit UI | `make e2e` (lihat [e2e/README.md](e2e/README.md)) |

## Sistem desain & kualitas UI

Aturan lengkap ada di **[frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)**: token warna (terang/gelap), skala tipografi (`text-display` … `text-xs`), grid jarak 4px, radius, komponen bersama, breakpoint, dan WCAG 2.2 AA.

Standar yang diverifikasi di 23 halaman × 3 lebar layar (390 / 820 / 1440) × 2 tema:
0 overflow horizontal · 0 konten terpotong · 0 pelanggaran axe-core WCAG AA · hanya ukuran huruf dari skala.

## Identitas brand (dari `docs/`)

| Elemen        | Makna                             | Implementasi                                   |
|---------------|-----------------------------------|------------------------------------------------|
| Monogram **Y**| Inisial Yasun                     | `components/brand/logo.tsx`, `app/icon.svg`    |
| Tanda kode `< >` | Belajar & praktik pemrograman  | Lengan Y, motif `<kategori />`, code window    |
| Kotak kuning `#FFC21A` | Titik awal, berani mencoba | Aksen hemat: badge unggulan, CTA, notifikasi |
| Navy `#0A1B44` & Cyan `#19B5F5` | Tepercaya, terbuka, eksploratif | Token warna di `globals.css` (light & dark) |

Tipografi: **Plus Jakarta Sans** (geometris, tebal — selaras wordmark) + JetBrains Mono.

> ⚠️ SVG logo saat ini adalah rekonstruksi vektor dari gambar di `docs/`. Ganti path di `logo.tsx`, `app/icon.svg`, dan `public/brand/logo-mark.svg` dengan file vektor resmi bila tersedia.

---

## Perintah

`make help` untuk daftar lengkap — `up`, `down`, `logs`, `prod`, `migrate`, `migration m="..."`, `seed`, `test`, `lint`, `typecheck`, `shell-db`, `shell-redis`, `clean`.
