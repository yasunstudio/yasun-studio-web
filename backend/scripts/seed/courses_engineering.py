"""Seed content — engineering track: Next.js, FastAPI, SQL, Docker, AI, plus a draft."""

from textwrap import dedent as d

from scripts.seed.types import A, CourseSeed, L, V

NEXTJS = CourseSeed(
    title="Web Modern dengan Next.js",
    summary="Bangun aplikasi web cepat dan SEO-friendly memakai Next.js App Router, Server Components & Server Actions.",
    category="Web Development",
    level=L.INTERMEDIATE,
    tags=["nextjs", "react", "typescript"],
    price=199_000,
    is_featured=True,
    video="https://www.youtube.com/watch?v=ZVnjOPwW4ZA",
    created_days_ago=80,
    description=d("""
        Next.js adalah framework React paling populer untuk aplikasi produksi. Kelas ini fokus
        pada **App Router** dan pola terbaru yang dipakai perusahaan teknologi saat ini.

        ## Yang akan kamu pelajari
        - Routing berbasis folder, layout, dan route group
        - Server Components vs Client Components
        - Data fetching, caching, dan revalidasi
        - Server Actions, validasi dengan Zod, dan autentikasi
        - Optimasi gambar/font, SEO, dan deploy dengan Docker

        ## Prasyarat
        Menguasai JavaScript modern dan dasar React (komponen, props, state).
    """),
    modules=[
        (
            "Bab 1 · Memulai dengan Next.js",
            [
                (
                    "Kenapa Next.js?",
                    V,
                    10,
                    True,
                    d("""
                Next.js menggabungkan rendering di server, routing, dan optimasi bawaan sehingga
                kamu bisa fokus pada fitur. Video ini membandingkan Next.js dengan React murni.
            """),
                ),
                (
                    "create-next-app dan struktur proyek",
                    A,
                    12,
                    True,
                    d("""
                ```bash
                npx create-next-app@latest toko-ku --typescript --tailwind --app
                ```

                Folder penting: `app/` (route), `public/` (aset statis), dan `next.config.ts`.
            """),
                ),
                (
                    "Routing dengan App Router",
                    A,
                    16,
                    False,
                    d("""
                ```text
                app/
                ├── page.tsx            → /
                ├── kelas/page.tsx      → /kelas
                └── kelas/[slug]/page.tsx → /kelas/python-dasar
                ```

                `layout.tsx` membungkus halaman di bawahnya dan **tidak di-render ulang** saat
                navigasi — cocok untuk header dan sidebar.
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Rendering & Data",
            [
                (
                    "Server vs Client Components",
                    A,
                    18,
                    False,
                    d("""
                Secara default semua komponen adalah **Server Component**: dirender di server,
                tidak mengirim JavaScript ke browser. Tambahkan `"use client"` hanya pada komponen
                yang butuh state, efek, atau event handler.
            """),
                ),
                (
                    "Data fetching dan caching",
                    V,
                    20,
                    False,
                    d("""
                ```tsx
                export default async function Page() {
                  const res = await fetch("https://api.contoh.com/kelas", {
                    next: { revalidate: 60, tags: ["kelas"] },
                  });
                  const kelas = await res.json();
                  return <DaftarKelas items={kelas} />;
                }
                ```
            """),
                ),
                (
                    "Loading dan error UI",
                    A,
                    12,
                    False,
                    d("""
                Tambahkan `loading.tsx` untuk skeleton otomatis dan `error.tsx` sebagai error
                boundary per segmen route. Pengalaman pengguna terasa jauh lebih profesional.
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Interaktivitas",
            [
                (
                    "Server Actions untuk form",
                    A,
                    18,
                    False,
                    d("""
                ```tsx
                async function simpan(formData: FormData) {
                  "use server";
                  await db.kelas.create({ data: { judul: formData.get("judul") } });
                  revalidateTag("kelas");
                }
                ```

                Tidak perlu membuat endpoint API terpisah untuk mutasi sederhana.
            """),
                ),
                (
                    "Validasi input dengan Zod",
                    A,
                    14,
                    False,
                    d("""
                ```ts
                const Skema = z.object({
                  email: z.email("Email tidak valid"),
                  sandi: z.string().min(8, "Minimal 8 karakter"),
                });
                ```

                Validasi di server wajib — validasi di browser hanya untuk kenyamanan pengguna.
            """),
                ),
                (
                    "Autentikasi dengan cookie httpOnly",
                    A,
                    20,
                    False,
                    d("""
                Simpan token sesi di cookie `httpOnly; Secure; SameSite=Lax` agar tidak bisa
                dibaca JavaScript di browser, lalu lindungi route di `proxy.ts`.
            """),
                ),
            ],
        ),
        (
            "Bab 4 · Menuju Produksi",
            [
                (
                    "Optimasi gambar dan font",
                    A,
                    12,
                    False,
                    d("""
                Gunakan `next/image` (ukuran responsif, lazy loading) dan `next/font` (tanpa
                *layout shift*). Dua hal kecil ini berdampak besar pada skor Core Web Vitals.
            """),
                ),
                (
                    "SEO dengan Metadata API",
                    A,
                    12,
                    False,
                    d("""
                ```ts
                export const metadata = {
                  title: "Kelas Python — Yasun Studio",
                  description: "Belajar Python dari nol.",
                };
                ```

                Untuk halaman dinamis gunakan `generateMetadata`. Jangan lupa `sitemap.ts` dan `robots.ts`.
            """),
                ),
                (
                    "Deploy dengan Docker",
                    A,
                    22,
                    False,
                    d("""
                Aktifkan `output: "standalone"` lalu gunakan multi-stage Dockerfile. Image produksi
                menjadi kecil (±150 MB) dan berjalan sebagai user non-root.
            """),
                ),
            ],
        ),
    ],
)

FASTAPI = CourseSeed(
    title="REST API Profesional dengan FastAPI",
    summary="Rancang API yang rapi, aman, teruji, dan terdokumentasi otomatis dengan FastAPI, PostgreSQL & Redis.",
    category="Backend",
    level=L.INTERMEDIATE,
    tags=["fastapi", "python", "api", "postgresql"],
    price=149_000,
    is_featured=True,
    video="https://www.youtube.com/watch?v=0sOvCWFmrtA",
    created_days_ago=75,
    description=d("""
        Bangun backend kelas produksi dengan arsitektur modular yang sama seperti platform
        Yasun Studio ini.

        ## Yang akan kamu pelajari
        - Routing, validasi dengan Pydantic, dan dokumentasi OpenAPI otomatis
        - SQLAlchemy async, migrasi Alembic, dan pola repository/service
        - Hashing password Argon2, JWT dengan refresh token, dan RBAC
        - Testing dengan pytest, caching Redis, dan deploy dengan Docker

        ## Prasyarat
        Lulus kelas *Dasar Pemrograman Python* atau pengalaman setara.
    """),
    modules=[
        (
            "Bab 1 · Fondasi FastAPI",
            [
                (
                    "Kenalan dengan FastAPI",
                    V,
                    10,
                    True,
                    d("""
                FastAPI cepat, modern, dan memanfaatkan type hint Python untuk validasi serta
                dokumentasi otomatis di `/docs`.
            """),
                ),
                (
                    "Path dan query parameter",
                    A,
                    14,
                    True,
                    d("""
                ```python
                @app.get("/kelas/{slug}")
                async def detail(slug: str, termasuk_materi: bool = False):
                    ...
                ```
            """),
                ),
                (
                    "Model data dengan Pydantic",
                    A,
                    16,
                    False,
                    d("""
                ```python
                class KelasBaru(BaseModel):
                    judul: str = Field(min_length=3, max_length=200)
                    harga: int = Field(ge=0)
                ```

                Request yang tidak valid otomatis ditolak dengan status 422 dan pesan yang jelas.
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Database",
            [
                (
                    "SQLAlchemy 2 async",
                    A,
                    20,
                    False,
                    d("""
                ```python
                class Kelas(Base):
                    __tablename__ = "kelas"
                    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid7)
                    judul: Mapped[str] = mapped_column(String(200))
                ```
            """),
                ),
                (
                    "Migrasi dengan Alembic",
                    A,
                    14,
                    False,
                    d("""
                ```bash
                alembic revision --autogenerate -m "tambah tabel kelas"
                alembic upgrade head
                ```

                Selalu tinjau file migrasi hasil autogenerate sebelum di-commit.
            """),
                ),
                (
                    "Pola repository dan service",
                    V,
                    18,
                    False,
                    d("""
                Pisahkan akses database (repository) dari aturan bisnis (service) agar kode mudah
                diuji dan diganti. Router hanya bertugas menerima request dan mengembalikan response.
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Keamanan",
            [
                (
                    "Hashing password dengan Argon2",
                    A,
                    12,
                    False,
                    d("""
                Jangan pernah menyimpan password asli. Gunakan Argon2id melalui `pwdlib` —
                algoritma pemenang Password Hashing Competition.
            """),
                ),
                (
                    "JWT dan refresh token",
                    A,
                    22,
                    False,
                    d("""
                Access token berumur pendek (15 menit), refresh token disimpan di Redis dan
                **dirotasi** setiap dipakai. Token yang dicuri bisa dicabut dari server.
            """),
                ),
                (
                    "Role-based access control",
                    A,
                    14,
                    False,
                    d("""
                ```python
                @router.get("/admin/kelas", dependencies=[Depends(require_roles(UserRole.EDITOR))])
                ```
            """),
                ),
            ],
        ),
        (
            "Bab 4 · Kualitas & Produksi",
            [
                (
                    "Testing dengan pytest",
                    A,
                    18,
                    False,
                    d("""
                ```python
                async def test_health(client):
                    res = await client.get("/health")
                    assert res.status_code == 200
                ```
            """),
                ),
                (
                    "Caching dan rate limiting dengan Redis",
                    A,
                    16,
                    False,
                    d("""
                Cache data publik yang sering dibaca dan batasi percobaan login per IP untuk
                mencegah brute force.
            """),
                ),
                (
                    "Deploy dengan Docker Compose",
                    A,
                    20,
                    False,
                    d("""
                Satukan API, PostgreSQL, Redis, dan Nginx dalam satu `docker-compose.yml`, lengkap
                dengan healthcheck dan migrasi otomatis saat start.
            """),
                ),
            ],
        ),
    ],
)

SQL = CourseSeed(
    title="SQL & PostgreSQL dari Nol",
    summary="Pahami database relasional, tulis query SQL yang efisien, dan rancang skema yang rapi dengan PostgreSQL.",
    category="Database",
    level=L.BEGINNER,
    tags=["sql", "postgresql", "database"],
    price=0,
    is_featured=False,
    video="https://www.youtube.com/watch?v=HXV3zeQKqGY",
    created_days_ago=70,
    description=d("""
        Data adalah inti setiap aplikasi. Kelas ini mengajarkan SQL dengan PostgreSQL — database
        open-source paling tangguh saat ini.

        ## Yang akan kamu pelajari
        - Konsep tabel, baris, kolom, dan relasi
        - `SELECT`, `WHERE`, `JOIN`, dan agregasi
        - Desain skema, normalisasi, index, dan transaksi

        ## Prasyarat
        Tidak ada. Docker disarankan untuk menjalankan PostgreSQL secara lokal.
    """),
    modules=[
        (
            "Bab 1 · Dasar Database Relasional",
            [
                (
                    "Apa itu database relasional?",
                    V,
                    10,
                    True,
                    d("""
                Database relasional menyimpan data dalam tabel yang saling terhubung melalui
                *primary key* dan *foreign key*.
            """),
                ),
                (
                    "Menjalankan PostgreSQL dengan Docker",
                    A,
                    10,
                    True,
                    d("""
                ```bash
                docker run -d --name pg -e POSTGRES_PASSWORD=rahasia -p 5432:5432 postgres:18-alpine
                docker exec -it pg psql -U postgres
                ```
            """),
                ),
                (
                    "Query SELECT pertama",
                    A,
                    12,
                    False,
                    d("""
                ```sql
                SELECT nama, kota FROM pelanggan;
                SELECT * FROM produk WHERE harga < 50000;
                ```
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Query Lanjutan",
            [
                (
                    "Filter, urutkan, dan batasi",
                    A,
                    12,
                    False,
                    d("""
                ```sql
                SELECT judul, harga FROM kelas
                WHERE harga = 0 AND level = 'pemula'
                ORDER BY created_at DESC
                LIMIT 10;
                ```
            """),
                ),
                (
                    "JOIN antar tabel",
                    V,
                    18,
                    False,
                    d("""
                ```sql
                SELECT u.nama, k.judul
                FROM pendaftaran p
                JOIN users u ON u.id = p.user_id
                JOIN kelas k ON k.id = p.kelas_id;
                ```
            """),
                ),
                (
                    "GROUP BY dan agregasi",
                    A,
                    14,
                    False,
                    d("""
                ```sql
                SELECT k.judul, COUNT(*) AS jumlah_pelajar
                FROM pendaftaran p JOIN kelas k ON k.id = p.kelas_id
                GROUP BY k.judul
                HAVING COUNT(*) > 5;
                ```
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Desain & Performa",
            [
                (
                    "Desain skema dan normalisasi",
                    A,
                    18,
                    False,
                    d("""
                Hindari data berulang: pisahkan entitas ke tabel sendiri dan hubungkan dengan
                foreign key. Gunakan constraint (`NOT NULL`, `UNIQUE`, `CHECK`) agar data selalu valid.
            """),
                ),
                (
                    "Index dan EXPLAIN",
                    A,
                    16,
                    False,
                    d("""
                ```sql
                CREATE INDEX ix_kelas_slug ON kelas (slug);
                EXPLAIN ANALYZE SELECT * FROM kelas WHERE slug = 'python-dasar';
                ```
            """),
                ),
                (
                    "Transaksi dan konsistensi data",
                    A,
                    14,
                    False,
                    d("""
                ```sql
                BEGIN;
                UPDATE saldo SET jumlah = jumlah - 100000 WHERE user_id = 1;
                UPDATE saldo SET jumlah = jumlah + 100000 WHERE user_id = 2;
                COMMIT;
                ```

                Jika salah satu gagal, `ROLLBACK` mengembalikan semuanya — prinsip ACID.
            """),
                ),
            ],
        ),
    ],
)

DOCKER = CourseSeed(
    title="Docker untuk Developer",
    summary="Kemas aplikasi ke dalam container, orkestrasi dengan Docker Compose, dan siapkan image produksi yang aman.",
    category="DevOps",
    level=L.BEGINNER,
    tags=["docker", "devops", "container"],
    price=0,
    is_featured=False,
    video="https://www.youtube.com/watch?v=fqMOX6JJhGo",
    created_days_ago=60,
    description=d("""
        "Di laptop saya jalan kok" tidak akan terdengar lagi. Docker membuat aplikasi berjalan
        sama persis di laptop, server, maupun cloud.

        ## Yang akan kamu pelajari
        - Image, container, dan Dockerfile
        - Volume, network, dan Docker Compose
        - Multi-stage build, keamanan, dan healthcheck

        ## Prasyarat
        Nyaman menggunakan terminal. Docker Desktop terpasang.
    """),
    modules=[
        (
            "Bab 1 · Konsep Container",
            [
                (
                    "Container vs virtual machine",
                    V,
                    10,
                    True,
                    d("""
                Container berbagi kernel host sehingga jauh lebih ringan dan cepat dibanding VM.
            """),
                ),
                (
                    "Image dan container",
                    A,
                    12,
                    True,
                    d("""
                ```bash
                docker pull nginx:alpine
                docker run -d -p 8080:80 --name web nginx:alpine
                docker ps
                ```
            """),
                ),
                (
                    "Menulis Dockerfile pertama",
                    A,
                    16,
                    False,
                    d("""
                ```dockerfile
                FROM python:3.14-slim
                WORKDIR /app
                COPY . .
                CMD ["python", "app.py"]
                ```
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Multi-container",
            [
                (
                    "Volume dan network",
                    A,
                    14,
                    False,
                    d("""
                Volume menyimpan data agar tidak hilang saat container dihapus; network membuat
                container saling terhubung lewat nama service.
            """),
                ),
                (
                    "Docker Compose",
                    V,
                    18,
                    False,
                    d("""
                ```yaml
                services:
                  api:
                    build: ./backend
                    depends_on: [db]
                  db:
                    image: postgres:18-alpine
                ```
            """),
                ),
                (
                    "Multi-stage build",
                    A,
                    14,
                    False,
                    d("""
                Pisahkan tahap *build* dan *runtime* agar image produksi hanya berisi yang
                benar-benar dibutuhkan — lebih kecil dan lebih aman.
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Siap Produksi",
            [
                (
                    "Keamanan image",
                    A,
                    12,
                    False,
                    d("""
                Gunakan base image resmi yang ramping, jalankan sebagai user non-root, dan jangan
                pernah menyimpan secret di dalam image.
            """),
                ),
                (
                    "Healthcheck dan restart policy",
                    A,
                    10,
                    False,
                    d("""
                ```dockerfile
                HEALTHCHECK --interval=15s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
                ```
            """),
                ),
                (
                    "Proyek: kontainerisasi aplikasi full-stack",
                    A,
                    30,
                    False,
                    d("""
                Kemas aplikasi frontend, backend, database, dan reverse proxy dalam satu stack
                Compose, lengkap dengan file `.env` dan perintah `make`.
            """),
                ),
            ],
        ),
    ],
)

AI = CourseSeed(
    title="Pengantar AI & Machine Learning",
    summary="Pahami konsep inti AI, ML, dan LLM — lalu praktikkan dengan pandas, scikit-learn, dan chatbot sederhana.",
    category="Artificial Intelligence",
    level=L.BEGINNER,
    tags=["ai", "machine-learning", "llm"],
    price=0,
    is_featured=False,
    video="https://www.youtube.com/watch?v=i_LwzRVP7bg",
    created_days_ago=45,
    description=d("""
        AI bukan sihir. Kelas ini membuka "kotak hitam" AI dengan bahasa sederhana dan praktik
        langsung, tanpa perlu latar belakang matematika tingkat lanjut.

        ## Yang akan kamu pelajari
        - Perbedaan AI, machine learning, dan deep learning
        - Eksplorasi data dengan pandas
        - Membuat dan mengevaluasi model dengan scikit-learn
        - Cara kerja Large Language Model dan prompt engineering
        - Membangun chatbot sederhana dengan API LLM

        ## Prasyarat
        Dasar Python (variabel, fungsi, list).
    """),
    modules=[
        (
            "Bab 1 · Memahami AI",
            [
                (
                    "AI, machine learning, dan deep learning",
                    V,
                    12,
                    True,
                    d("""
                AI adalah payung besar; machine learning adalah cara mesin belajar dari data;
                deep learning adalah machine learning dengan jaringan saraf berlapis.
            """),
                ),
                (
                    "Jenis-jenis machine learning",
                    A,
                    12,
                    True,
                    d("""
                | Jenis | Contoh |
                |---|---|
                | Supervised | Prediksi harga rumah |
                | Unsupervised | Segmentasi pelanggan |
                | Reinforcement | Robot belajar berjalan |
            """),
                ),
                (
                    "Menyiapkan Jupyter Notebook",
                    A,
                    10,
                    False,
                    d("""
                ```bash
                pip install jupyterlab pandas scikit-learn
                jupyter lab
                ```
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Machine Learning Praktis",
            [
                (
                    "Eksplorasi data dengan pandas",
                    A,
                    16,
                    False,
                    d("""
                ```python
                import pandas as pd
                df = pd.read_csv("rumah.csv")
                df.describe()
                df.groupby("kota")["harga"].mean()
                ```
            """),
                ),
                (
                    "Regresi linear dengan scikit-learn",
                    V,
                    20,
                    False,
                    d("""
                ```python
                from sklearn.linear_model import LinearRegression
                model = LinearRegression().fit(X_train, y_train)
                prediksi = model.predict(X_test)
                ```
            """),
                ),
                (
                    "Mengevaluasi model",
                    A,
                    14,
                    False,
                    d("""
                Pisahkan data latih dan data uji, lalu ukur dengan metrik seperti **MAE** atau
                **akurasi**. Model yang bagus di data latih tetapi buruk di data uji mengalami
                *overfitting*.
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Large Language Model",
            [
                (
                    "Bagaimana LLM bekerja?",
                    A,
                    15,
                    False,
                    d("""
                LLM memprediksi token berikutnya berdasarkan konteks. Kemampuan "bernalar" muncul
                dari pelatihan pada data teks dalam skala sangat besar.
            """),
                ),
                (
                    "Prompt engineering",
                    A,
                    14,
                    False,
                    d("""
                Prompt yang baik memiliki: **peran**, **konteks**, **tugas yang spesifik**, dan
                **format keluaran**. Berikan contoh bila memungkinkan.
            """),
                ),
                (
                    "Proyek: chatbot sederhana",
                    A,
                    30,
                    False,
                    d("""
                Bangun chatbot tanya-jawab materi kelas memakai API LLM, simpan riwayat percakapan,
                dan tampilkan jawabannya secara *streaming*. Ingat: jangan pernah menaruh API key
                di kode frontend.
            """),
                ),
            ],
        ),
    ],
)

DSA_DRAFT = CourseSeed(
    title="Struktur Data & Algoritma",
    summary="Persiapan wawancara teknis: kompleksitas waktu, array, linked list, tree, graph, dan dynamic programming.",
    category="Programming",
    level=L.ADVANCED,
    tags=["algoritma", "struktur-data", "interview"],
    price=249_000,
    is_featured=False,
    is_published=False,  # still being written — shows the draft state in admin
    created_days_ago=7,
    description=d("""
        Kelas sedang disusun. Target rilis: kuartal depan.

        ## Rencana materi
        - Notasi Big-O dan analisis kompleksitas
        - Array, hash map, stack, dan queue
        - Tree, graph, dan algoritma pencarian
        - Dynamic programming
    """),
    modules=[
        (
            "Bab 1 · Kompleksitas Algoritma",
            [
                (
                    "Memahami notasi Big-O",
                    A,
                    15,
                    True,
                    d("""
                Big-O menggambarkan bagaimana waktu eksekusi bertumbuh terhadap ukuran input:
                `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`.
            """),
                ),
                (
                    "Analisis kode sederhana",
                    A,
                    15,
                    False,
                    d("""
                Latihan menentukan kompleksitas dari perulangan tunggal, bersarang, dan rekursi.
            """),
                ),
            ],
        ),
    ],
)
