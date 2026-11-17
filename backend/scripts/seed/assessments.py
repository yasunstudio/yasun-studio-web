"""Seeded assessments: an end-of-chapter quiz for every module, plus coding exercises.

Exercise `expected_output` values are verified by running each solution
(tests/test_seed_content.py) so the seed can never ship an unsolvable exercise.
"""

from textwrap import dedent as d
from typing import Any

LETTERS = "abcdef"


def q(
    qid: str, prompt: str, options: list[str], answer: int | list[int], explanation: str
) -> dict[str, Any]:
    """Compact question builder. `answer` = index (single) or list of indexes (multiple)."""
    multiple = isinstance(answer, list)
    idx = answer if isinstance(answer, list) else [answer]
    return {
        "id": qid,
        "prompt": prompt,
        "multiple": multiple,
        "options": [{"id": LETTERS[i], "text": t} for i, t in enumerate(options)],
        "answer": [LETTERS[i] for i in idx],
        "explanation": explanation,
    }


# (course title, module index) → (quiz title, minutes, pass_score, questions)
QUIZZES: dict[tuple[str, int], tuple[str, int, int, list[dict[str, Any]]]] = {
    # ------------------------------------------------------------------ Python
    ("Dasar Pemrograman Python", 0): (
        "Kuis Bab 1: Mengenal Python",
        5,
        70,
        [
            q(
                "q1",
                "Perintah apa yang menampilkan teks ke layar di Python?",
                ["echo()", "print()", "console.log()", "write()"],
                1,
                "`print()` adalah fungsi bawaan Python untuk menampilkan output.",
            ),
            q(
                "q2",
                "Ekstensi file untuk program Python adalah…",
                [".js", ".py", ".pt", ".pyt"],
                1,
                "File Python berakhiran `.py`.",
            ),
            q(
                "q3",
                "Pilih **semua** bidang yang umum memakai Python.",
                ["Data science & AI", "Otomasi tugas", "Backend web", "Driver kartu grafis"],
                [0, 1, 2],
                "Python populer untuk data/AI, otomasi, dan web. Driver perangkat keras umumnya ditulis dengan C/C++.",
            ),
        ],
    ),
    ("Dasar Pemrograman Python", 1): (
        "Kuis Bab 2: Variabel & Tipe Data",
        6,
        70,
        [
            q(
                "q1",
                "Nama variabel mana yang **mengikuti** konvensi Python?",
                ["HargaKopi", "harga-kopi", "harga_kopi", "2harga"],
                2,
                "Python memakai *snake_case*: huruf kecil dipisah garis bawah.",
            ),
            q(
                "q2",
                "Apa tipe data dari `input()`?",
                ["int", "str", "float", "Tergantung yang diketik"],
                1,
                "`input()` selalu mengembalikan string; konversi dengan `int()` atau `float()`.",
            ),
            q(
                "q3",
                "Hasil dari `type(3.14)` adalah…",
                ["int", "str", "float", "decimal"],
                2,
                "Angka dengan titik desimal bertipe `float`.",
            ),
            q(
                "q4",
                "Bagaimana menyisipkan variabel `nama` ke dalam teks dengan f-string?",
                ['"Halo {nama}"', 'f"Halo {nama}"', '"Halo " + {nama}', "f'Halo $nama'"],
                1,
                "Awali string dengan `f` lalu tulis variabel di dalam `{}`.",
            ),
        ],
    ),
    ("Dasar Pemrograman Python", 2): (
        "Kuis Bab 3: Logika & Perulangan",
        6,
        70,
        [
            q(
                "q1",
                "Apa yang menandai blok kode di dalam `if` pada Python?",
                ["Kurung kurawal {}", "Indentasi", "Kata kunci end", "Titik koma"],
                1,
                "Python memakai indentasi (umumnya 4 spasi) untuk menandai blok.",
            ),
            q(
                "q2",
                "Berapa kali `for i in range(1, 6)` berulang?",
                ["4", "5", "6", "Tak terhingga"],
                1,
                "`range(1, 6)` menghasilkan 1, 2, 3, 4, 5.",
            ),
            q(
                "q3",
                "Kata kunci untuk menghentikan perulangan lebih awal adalah…",
                ["stop", "exit", "break", "return"],
                2,
                "`break` keluar dari perulangan terdekat.",
            ),
        ],
    ),
    ("Dasar Pemrograman Python", 3): (
        "Kuis Bab 4: Fungsi & Struktur Data",
        6,
        70,
        [
            q(
                "q1",
                "Method untuk menambah elemen di akhir list adalah…",
                ["add()", "push()", "append()", "insert_end()"],
                2,
                "`list.append(x)` menambahkan `x` di akhir list.",
            ),
            q(
                "q2",
                'Bagaimana mengambil nilai `"Budi"` dari `siswa = {"nama": "Budi"}`?',
                ["siswa.nama", 'siswa["nama"]', "siswa[0]", "siswa->nama"],
                1,
                "Dictionary diakses dengan kunci di dalam kurung siku.",
            ),
            q(
                "q3",
                "Apa keuntungan utama membuat fungsi?",
                [
                    "Program jadi lebih lambat",
                    "Kode bisa dipakai ulang dan mudah dibaca",
                    "Variabel jadi global",
                    "Tidak perlu indentasi",
                ],
                1,
                "Fungsi menghindari pengulangan kode dan memberi nama pada sebuah langkah.",
            ),
        ],
    ),
    # -------------------------------------------------------------- JavaScript
    ("JavaScript Modern untuk Pemula", 0): (
        "Kuis Bab 1: Fondasi JavaScript",
        5,
        70,
        [
            q(
                "q1",
                "Deklarasi mana yang sebaiknya dipakai secara default?",
                ["var", "let", "const", "global"],
                2,
                "Gunakan `const` kecuali nilainya memang perlu diubah.",
            ),
            q(
                "q2",
                "Hasil `0 == '0'` dan `0 === '0'` berturut-turut adalah…",
                ["true, true", "true, false", "false, false", "false, true"],
                1,
                "`==` mengonversi tipe sehingga bernilai true; `===` membandingkan tipe juga sehingga false.",
            ),
            q(
                "q3",
                "Di mana saja JavaScript bisa dijalankan?",
                [
                    "Hanya di browser",
                    "Browser dan server (Node.js)",
                    "Hanya di server",
                    "Hanya di aplikasi mobile",
                ],
                1,
                "Selain browser, JavaScript berjalan di server lewat Node.js, Deno, atau Bun.",
            ),
        ],
    ),
    ("JavaScript Modern untuk Pemula", 1): (
        "Kuis Bab 2: Fungsi, Array & Objek",
        6,
        70,
        [
            q(
                "q1",
                "Method array mana yang menghasilkan array baru dengan elemen yang sudah ditransformasi?",
                ["forEach", "map", "find", "some"],
                1,
                "`map` mengembalikan array baru hasil transformasi setiap elemen.",
            ),
            q(
                "q2",
                "`[1, 2, 3].reduce((a, b) => a + b, 0)` menghasilkan…",
                ["0", "6", "[1, 2, 3]", "123"],
                1,
                "`reduce` menjumlahkan semua elemen menjadi 6.",
            ),
            q(
                "q3",
                "Apa hasil `const { kota } = { nama: 'Andi', kota: 'Bandung' }`?",
                ["kota = undefined", "kota = 'Bandung'", "Error", "kota = { kota: 'Bandung' }"],
                1,
                "Destructuring mengambil properti `kota` ke variabel bernama sama.",
            ),
        ],
    ),
    ("JavaScript Modern untuk Pemula", 2): (
        "Kuis Bab 3: DOM & Event",
        5,
        70,
        [
            q(
                "q1",
                "Cara memilih elemen pertama dengan id `beli` adalah…",
                [
                    'document.querySelector("#beli")',
                    'document.select("beli")',
                    'document.getElement(".beli")',
                    'window.find("#beli")',
                ],
                0,
                "`querySelector` menerima selektor CSS; `#` untuk id.",
            ),
            q(
                "q2",
                "Fungsi `event.preventDefault()` berguna untuk…",
                [
                    "Menghapus elemen",
                    "Mencegah perilaku bawaan browser",
                    "Menghentikan semua JavaScript",
                    "Me-reload halaman",
                ],
                1,
                "Misalnya mencegah form mengirim data dan memuat ulang halaman.",
            ),
            q(
                "q3",
                "Penyimpanan mana yang membuat data tetap ada setelah halaman dimuat ulang?",
                ["Variabel biasa", "localStorage", "console", "sessionTimeout"],
                1,
                "`localStorage` menyimpan data di browser tanpa batas waktu.",
            ),
        ],
    ),
    ("JavaScript Modern untuk Pemula", 3): (
        "Kuis Bab 4: JavaScript Asinkron",
        6,
        70,
        [
            q(
                "q1",
                "Urutan output `console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4);` adalah…",
                ["1 2 3 4", "1 4 3 2", "1 4 2 3", "1 3 4 2"],
                1,
                "Kode sinkron dulu (1, 4), lalu microtask Promise (3), terakhir macrotask setTimeout (2).",
            ),
            q(
                "q2",
                "Apakah `fetch` melempar error ketika server membalas 404?",
                [
                    "Ya, selalu",
                    "Tidak, kita harus mengecek `res.ok`",
                    "Hanya di Chrome",
                    "Hanya jika memakai await",
                ],
                1,
                "`fetch` hanya gagal untuk error jaringan; status HTTP harus dicek manual.",
            ),
            q(
                "q3",
                "Pilih **semua** pernyataan yang benar tentang `async/await`.",
                [
                    "Fungsi async selalu mengembalikan Promise",
                    "await hanya bisa di dalam fungsi async (atau top-level module)",
                    "await membuat kode berjalan paralel otomatis",
                    "Error ditangani dengan try/catch",
                ],
                [0, 1, 3],
                "`await` justru menunggu Promise selesai secara berurutan; paralel butuh `Promise.all`.",
            ),
        ],
    ),
    # ----------------------------------------------------------------- Next.js
    ("Web Modern dengan Next.js", 0): (
        "Kuis Bab 1: Memulai dengan Next.js",
        5,
        70,
        [
            q(
                "q1",
                "File apa yang mendefinisikan halaman untuk sebuah route di App Router?",
                ["index.tsx", "page.tsx", "route.tsx", "view.tsx"],
                1,
                "Setiap folder route membutuhkan `page.tsx` agar bisa diakses.",
            ),
            q(
                "q2",
                "Folder `app/kelas/[slug]/page.tsx` melayani URL…",
                ["/kelas", "/kelas/[slug]", "/kelas/python-dasar (dinamis)", "/slug"],
                2,
                "Kurung siku menandakan segmen dinamis.",
            ),
            q(
                "q3",
                "Keunggulan `layout.tsx` adalah…",
                [
                    "Di-render ulang di setiap navigasi",
                    "Tidak di-render ulang saat berpindah halaman di bawahnya",
                    "Hanya untuk SEO",
                    "Menggantikan page.tsx",
                ],
                1,
                "Layout dipertahankan saat navigasi sehingga cocok untuk header/sidebar.",
            ),
        ],
    ),
    ("Web Modern dengan Next.js", 1): (
        "Kuis Bab 2: Rendering & Data",
        6,
        70,
        [
            q(
                "q1",
                "Secara default, komponen di App Router adalah…",
                ["Client Component", "Server Component", "Static HTML", "Web Component"],
                1,
                'Tambahkan `"use client"` hanya bila butuh interaktivitas.',
            ),
            q(
                "q2",
                "Kapan sebuah komponen **harus** menjadi Client Component?",
                [
                    "Saat mengambil data dari database",
                    "Saat memakai useState atau event handler",
                    "Saat menampilkan teks statis",
                    "Saat memakai metadata",
                ],
                1,
                "State, efek, dan event hanya berjalan di browser.",
            ),
            q(
                "q3",
                "File yang otomatis menampilkan UI saat data sedang dimuat adalah…",
                ["spinner.tsx", "loading.tsx", "wait.tsx", "suspense.tsx"],
                1,
                "`loading.tsx` dibungkus Suspense secara otomatis oleh Next.js.",
            ),
        ],
    ),
    ("Web Modern dengan Next.js", 2): (
        "Kuis Bab 3: Interaktivitas",
        6,
        70,
        [
            q(
                "q1",
                "Direktif apa yang menandai fungsi sebagai Server Action?",
                ['"use client"', '"use server"', '"use action"', '"server only"'],
                1,
                '`"use server"` membuat fungsi bisa dipanggil dari form tetapi dieksekusi di server.',
            ),
            q(
                "q2",
                "Di mana validasi input **wajib** dilakukan?",
                ["Hanya di browser", "Di server", "Di CSS", "Tidak perlu"],
                1,
                "Validasi browser bisa dilewati; server adalah garis pertahanan sebenarnya.",
            ),
            q(
                "q3",
                "Atribut cookie mana yang mencegah JavaScript membaca token sesi?",
                ["Secure", "SameSite", "HttpOnly", "Path"],
                2,
                "`HttpOnly` membuat cookie tidak bisa diakses `document.cookie`.",
            ),
        ],
    ),
    ("Web Modern dengan Next.js", 3): (
        "Kuis Bab 4: Menuju Produksi",
        5,
        70,
        [
            q(
                "q1",
                "Opsi `next.config` untuk image Docker yang ringkas adalah…",
                ['output: "export"', 'output: "standalone"', 'mode: "docker"', 'target: "server"'],
                1,
                "`standalone` menyalin hanya file yang dibutuhkan untuk menjalankan server.",
            ),
            q(
                "q2",
                "Fungsi untuk metadata halaman dinamis adalah…",
                ["getMetadata", "generateMetadata", "useMetadata", "createHead"],
                1,
                "`generateMetadata` dapat mengambil data sebelum menentukan title/description.",
            ),
            q(
                "q3",
                "Manfaat utama `next/font` adalah…",
                [
                    "Font lebih tebal",
                    "Menghindari layout shift dan request ke pihak ketiga",
                    "Menambah animasi",
                    "Menerjemahkan teks",
                ],
                1,
                "Font di-host sendiri dan ukurannya diketahui sejak awal.",
            ),
        ],
    ),
    # ----------------------------------------------------------------- FastAPI
    ("REST API Profesional dengan FastAPI", 0): (
        "Kuis Bab 1: Fondasi FastAPI",
        5,
        70,
        [
            q(
                "q1",
                "Di URL mana dokumentasi interaktif FastAPI tersedia secara default?",
                ["/swagger", "/docs", "/api", "/help"],
                1,
                "FastAPI menyediakan Swagger UI di `/docs`.",
            ),
            q(
                "q2",
                "Status code apa yang dikembalikan bila body request tidak valid?",
                ["400", "404", "422", "500"],
                2,
                "FastAPI mengembalikan 422 Unprocessable Entity.",
            ),
            q(
                "q3",
                "Library yang dipakai FastAPI untuk validasi data adalah…",
                ["Marshmallow", "Pydantic", "Cerberus", "attrs"],
                1,
                "Model Pydantic menjadi skema request/response.",
            ),
        ],
    ),
    ("REST API Profesional dengan FastAPI", 1): (
        "Kuis Bab 2: Database",
        6,
        70,
        [
            q(
                "q1",
                "Perintah untuk menjalankan semua migrasi Alembic yang tertunda adalah…",
                ["alembic run", "alembic upgrade head", "alembic migrate", "alembic apply"],
                1,
                "`upgrade head` membawa skema ke revisi terbaru.",
            ),
            q(
                "q2",
                "Pada pola repository/service, aturan bisnis sebaiknya diletakkan di…",
                ["Router", "Repository", "Service", "Model"],
                2,
                "Repository hanya mengakses data; service menyimpan aturan bisnis.",
            ),
            q(
                "q3",
                "Mengapa hasil autogenerate Alembic harus ditinjau?",
                [
                    "Karena selalu salah",
                    "Karena beberapa perubahan (mis. enum, rename) tidak terdeteksi sempurna",
                    "Agar lebih cepat",
                    "Tidak perlu ditinjau",
                ],
                1,
                "Autogenerate tidak mendeteksi rename dan beberapa perubahan tipe.",
            ),
        ],
    ),
    ("REST API Profesional dengan FastAPI", 2): (
        "Kuis Bab 3: Keamanan",
        6,
        70,
        [
            q(
                "q1",
                "Algoritma hashing password yang direkomendasikan saat ini adalah…",
                ["MD5", "SHA-1", "Argon2id", "Base64"],
                2,
                "Argon2id tahan serangan GPU; MD5/SHA-1 terlalu cepat, Base64 bukan hashing.",
            ),
            q(
                "q2",
                "Mengapa access token dibuat berumur pendek?",
                [
                    "Agar server lebih ringan",
                    "Membatasi dampak jika token dicuri",
                    "Karena JWT tidak bisa panjang",
                    "Supaya pengguna sering login",
                ],
                1,
                "Token yang bocor hanya berlaku sebentar; refresh token bisa dicabut di server.",
            ),
            q(
                "q3",
                "Status code yang tepat saat pengguna login tetapi tidak punya izin adalah…",
                ["401", "403", "404", "409"],
                1,
                "401 = belum terautentikasi; 403 = terautentikasi tetapi tidak berwenang.",
            ),
        ],
    ),
    ("REST API Profesional dengan FastAPI", 3): (
        "Kuis Bab 4: Kualitas & Produksi",
        5,
        70,
        [
            q(
                "q1",
                "Fungsi utama rate limiting pada endpoint login adalah…",
                [
                    "Mempercepat login",
                    "Mencegah brute force",
                    "Mengurangi ukuran response",
                    "Mengganti CAPTCHA sepenuhnya",
                ],
                1,
                "Membatasi percobaan per IP membuat tebak-tebakan password tidak praktis.",
            ),
            q(
                "q2",
                "Data apa yang paling cocok di-cache?",
                [
                    "Data yang sering dibaca dan jarang berubah",
                    "Data transaksi pembayaran",
                    "Password pengguna",
                    "Token sekali pakai",
                ],
                0,
                "Cache efektif untuk data publik yang dibaca berulang kali.",
            ),
            q(
                "q3",
                "Pilih **semua** yang sebaiknya ada di stack Docker Compose produksi.",
                [
                    "Healthcheck",
                    "Migrasi otomatis saat start",
                    "Port database terbuka ke internet",
                    "Restart policy",
                ],
                [0, 1, 3],
                "Database tidak boleh diekspos ke publik; akses lewat jaringan internal saja.",
            ),
        ],
    ),
    # --------------------------------------------------------------------- Git
    ("Git & GitHub untuk Kolaborasi", 0): (
        "Kuis Bab 1: Dasar Version Control",
        5,
        70,
        [
            q(
                "q1",
                "Perintah untuk memasukkan perubahan ke staging area adalah…",
                ["git commit", "git add", "git push", "git stage-all"],
                1,
                "`git add` menyiapkan perubahan sebelum commit.",
            ),
            q(
                "q2",
                "Pesan commit mana yang paling baik?",
                ["update", "fix bug", "feat: tambah halaman beranda", "asdf"],
                2,
                "Pesan jelas dengan konvensi memudahkan membaca riwayat.",
            ),
            q(
                "q3",
                "Perintah untuk melihat riwayat commit secara ringkas adalah…",
                ["git log --oneline", "git history", "git show-all", "git status"],
                0,
                "`--oneline` menampilkan satu baris per commit.",
            ),
        ],
    ),
    ("Git & GitHub untuk Kolaborasi", 1): (
        "Kuis Bab 2: Branching",
        6,
        70,
        [
            q(
                "q1",
                "Perintah modern untuk membuat dan pindah ke branch baru adalah…",
                ["git branch -go", "git switch -c nama", "git new nama", "git checkout --create"],
                1,
                "`git switch -c` membuat branch lalu berpindah ke sana.",
            ),
            q(
                "q2",
                "Konflik merge terjadi ketika…",
                [
                    "Dua branch mengubah baris yang sama",
                    "Branch terlalu banyak",
                    "Commit terlalu kecil",
                    "Remote offline",
                ],
                0,
                "Git tidak bisa memutuskan versi mana yang benar secara otomatis.",
            ),
            q(
                "q3",
                "Aturan emas rebase adalah…",
                [
                    "Selalu rebase main",
                    "Jangan rebase branch yang sudah dipakai orang lain",
                    "Rebase lebih aman dari merge",
                    "Rebase menghapus konflik",
                ],
                1,
                "Rebase menulis ulang riwayat; merusak pekerjaan rekan bila branch sudah dibagikan.",
            ),
        ],
    ),
    ("Git & GitHub untuk Kolaborasi", 2): (
        "Kuis Bab 3: Bekerja dengan GitHub",
        5,
        70,
        [
            q(
                "q1",
                "Pilih **semua** ciri pull request yang baik.",
                [
                    "Kecil dan fokus pada satu tujuan",
                    "Deskripsi jelas",
                    "Menggabungkan 30 fitur sekaligus",
                    "Screenshot untuk perubahan UI",
                ],
                [0, 1, 3],
                "PR kecil lebih cepat direview dan lebih kecil risikonya.",
            ),
            q(
                "q2",
                "File workflow GitHub Actions disimpan di folder…",
                [".github/workflows", ".actions", "ci/", ".git/hooks"],
                0,
                "GitHub membaca file YAML di `.github/workflows/`.",
            ),
            q(
                "q3",
                "Perintah untuk mengirim commit lokal ke GitHub adalah…",
                ["git pull", "git push", "git fetch", "git sync"],
                1,
                "`git push` mengirim commit ke remote.",
            ),
        ],
    ),
    # --------------------------------------------------------------------- SQL
    ("SQL & PostgreSQL dari Nol", 0): (
        "Kuis Bab 1: Database Relasional",
        5,
        70,
        [
            q(
                "q1",
                "Kolom yang mengidentifikasi setiap baris secara unik disebut…",
                ["Foreign key", "Primary key", "Index key", "Unique row"],
                1,
                "Primary key bersifat unik dan tidak boleh NULL.",
            ),
            q(
                "q2",
                "Query untuk mengambil semua kolom dari tabel `produk` adalah…",
                ["GET * FROM produk", "SELECT * FROM produk", "SHOW produk", "FETCH produk"],
                1,
                "`SELECT *` memilih semua kolom.",
            ),
            q(
                "q3",
                "Foreign key berfungsi untuk…",
                [
                    "Mempercepat query",
                    "Menghubungkan baris ke tabel lain",
                    "Mengenkripsi data",
                    "Mengurutkan data",
                ],
                1,
                "Foreign key menjaga integritas relasi antar tabel.",
            ),
        ],
    ),
    ("SQL & PostgreSQL dari Nol", 1): (
        "Kuis Bab 2: Query Lanjutan",
        6,
        70,
        [
            q(
                "q1",
                "Klausa untuk menyaring hasil **setelah** pengelompokan adalah…",
                ["WHERE", "HAVING", "FILTER", "ORDER BY"],
                1,
                "`WHERE` menyaring baris; `HAVING` menyaring kelompok.",
            ),
            q(
                "q2",
                "JOIN yang tetap menampilkan semua baris tabel kiri walau tidak ada pasangan adalah…",
                ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"],
                1,
                "Baris tanpa pasangan diisi NULL pada kolom tabel kanan.",
            ),
            q(
                "q3",
                "Urutan klausa yang benar adalah…",
                [
                    "SELECT … WHERE … FROM",
                    "SELECT … FROM … WHERE … ORDER BY … LIMIT",
                    "FROM … SELECT … LIMIT",
                    "SELECT … ORDER BY … WHERE",
                ],
                1,
                "SQL memiliki urutan klausa yang baku.",
            ),
        ],
    ),
    ("SQL & PostgreSQL dari Nol", 2): (
        "Kuis Bab 3: Desain & Performa",
        6,
        70,
        [
            q(
                "q1",
                "Apa yang terjadi jika satu perintah dalam transaksi gagal lalu `ROLLBACK`?",
                [
                    "Hanya perintah gagal yang dibatalkan",
                    "Semua perubahan dalam transaksi dibatalkan",
                    "Database terhapus",
                    "Tidak ada efek",
                ],
                1,
                "Transaksi bersifat atomik: semua atau tidak sama sekali.",
            ),
            q(
                "q2",
                "Perintah untuk melihat rencana eksekusi query adalah…",
                ["DESCRIBE", "EXPLAIN", "PLAN", "TRACE"],
                1,
                "`EXPLAIN ANALYZE` juga menjalankan query dan mengukur waktunya.",
            ),
            q(
                "q3",
                "Pilih **semua** constraint yang menjaga validitas data.",
                ["NOT NULL", "UNIQUE", "CHECK", "SELECT"],
                [0, 1, 2],
                "`SELECT` adalah query, bukan constraint.",
            ),
        ],
    ),
    # ------------------------------------------------------------------ Docker
    ("Docker untuk Developer", 0): (
        "Kuis Bab 1: Konsep Container",
        5,
        70,
        [
            q(
                "q1",
                "Mengapa container lebih ringan daripada virtual machine?",
                [
                    "Karena tidak butuh RAM",
                    "Berbagi kernel dengan host",
                    "Karena ditulis dengan Go",
                    "Karena tanpa jaringan",
                ],
                1,
                "Container tidak menjalankan OS penuh; ia berbagi kernel host.",
            ),
            q(
                "q2",
                "Perintah untuk menjalankan container di latar belakang adalah…",
                ["docker run -d", "docker start --bg", "docker exec", "docker up"],
                0,
                "Flag `-d` (detached) menjalankan container di background.",
            ),
            q(
                "q3",
                "Instruksi Dockerfile untuk menentukan image dasar adalah…",
                ["BASE", "FROM", "IMAGE", "USE"],
                1,
                "Setiap Dockerfile diawali `FROM`.",
            ),
        ],
    ),
    ("Docker untuk Developer", 1): (
        "Kuis Bab 2: Multi-container",
        6,
        70,
        [
            q(
                "q1",
                "Bagaimana container saling terhubung di Docker Compose?",
                [
                    "Lewat IP publik",
                    "Lewat nama service di jaringan yang sama",
                    "Harus pakai port 80",
                    "Tidak bisa",
                ],
                1,
                "Compose membuat DNS internal berdasarkan nama service.",
            ),
            q(
                "q2",
                "Data database tetap ada setelah container dihapus jika memakai…",
                ["Volume", "Layer image", "ENV", "Label"],
                0,
                "Volume disimpan di luar siklus hidup container.",
            ),
            q(
                "q3",
                "Keuntungan multi-stage build adalah…",
                [
                    "Build lebih lambat",
                    "Image produksi lebih kecil dan aman",
                    "Tidak perlu Dockerfile",
                    "Menghapus kebutuhan .dockerignore",
                ],
                1,
                "Tool build tidak ikut ke image akhir.",
            ),
        ],
    ),
    ("Docker untuk Developer", 2): (
        "Kuis Bab 3: Siap Produksi",
        5,
        70,
        [
            q(
                "q1",
                "Praktik keamanan image yang benar adalah…",
                [
                    "Menjalankan sebagai root",
                    "Menyimpan API key di Dockerfile",
                    "Menjalankan sebagai user non-root",
                    "Memakai tag latest di produksi tanpa pin",
                ],
                2,
                "User non-root membatasi dampak bila container dibobol.",
            ),
            q(
                "q2",
                "HEALTHCHECK berguna untuk…",
                [
                    "Mengurangi ukuran image",
                    "Memberi tahu Docker apakah aplikasi benar-benar sehat",
                    "Membuat backup",
                    "Mengganti log",
                ],
                1,
                "Orkestrator dapat me-restart atau menahan traffic ke container yang tidak sehat.",
            ),
            q(
                "q3",
                "Di mana sebaiknya secret (password, API key) disimpan?",
                [
                    "Di dalam image",
                    "Variabel lingkungan / secret manager saat runtime",
                    "Di README",
                    "Di nama container",
                ],
                1,
                "Secret disuntikkan saat runtime, bukan dibakar ke image.",
            ),
        ],
    ),
    # ---------------------------------------------------------------------- AI
    ("Pengantar AI & Machine Learning", 0): (
        "Kuis Bab 1: Memahami AI",
        5,
        70,
        [
            q(
                "q1",
                "Hubungan AI, machine learning, dan deep learning adalah…",
                ["Ketiganya sama", "DL ⊂ ML ⊂ AI", "AI ⊂ ML ⊂ DL", "Tidak berhubungan"],
                1,
                "Deep learning adalah bagian dari ML, dan ML adalah bagian dari AI.",
            ),
            q(
                "q2",
                "Memprediksi harga rumah dari data berlabel termasuk…",
                [
                    "Supervised learning",
                    "Unsupervised learning",
                    "Reinforcement learning",
                    "Rule-based system",
                ],
                0,
                "Ada label (harga) yang dipelajari model.",
            ),
            q(
                "q3",
                "Mengelompokkan pelanggan tanpa label termasuk…",
                ["Supervised", "Unsupervised", "Reinforcement", "Regresi"],
                1,
                "Clustering adalah contoh unsupervised learning.",
            ),
        ],
    ),
    ("Pengantar AI & Machine Learning", 1): (
        "Kuis Bab 2: Machine Learning Praktis",
        6,
        70,
        [
            q(
                "q1",
                "Fungsi pandas untuk melihat ringkasan statistik adalah…",
                ["df.info()", "df.describe()", "df.summary()", "df.stats()"],
                1,
                "`describe()` menampilkan mean, std, min, max, dsb.",
            ),
            q(
                "q2",
                "Model sangat akurat di data latih tetapi buruk di data uji mengalami…",
                ["Underfitting", "Overfitting", "Normalisasi", "Regularisasi"],
                1,
                "Model menghafal data latih dan gagal menggeneralisasi.",
            ),
            q(
                "q3",
                "Mengapa data dibagi menjadi data latih dan data uji?",
                [
                    "Agar training lebih cepat",
                    "Untuk mengukur performa pada data yang belum pernah dilihat",
                    "Karena wajib di pandas",
                    "Agar file lebih kecil",
                ],
                1,
                "Data uji mensimulasikan data dunia nyata.",
            ),
        ],
    ),
    ("Pengantar AI & Machine Learning", 2): (
        "Kuis Bab 3: Large Language Model",
        6,
        70,
        [
            q(
                "q1",
                "Secara mendasar, LLM bekerja dengan…",
                [
                    "Mencari jawaban di database",
                    "Memprediksi token berikutnya",
                    "Menjalankan aturan if-else",
                    "Menyalin Wikipedia",
                ],
                1,
                "LLM memprediksi token berikutnya berdasarkan konteks.",
            ),
            q(
                "q2",
                "Pilih **semua** unsur prompt yang baik.",
                ["Peran", "Konteks", "Tugas yang spesifik", "Format keluaran"],
                [0, 1, 2, 3],
                "Keempatnya membuat jawaban lebih relevan dan konsisten.",
            ),
            q(
                "q3",
                "Di mana API key LLM sebaiknya disimpan?",
                [
                    "Di kode frontend",
                    "Di server / variabel lingkungan",
                    "Di localStorage",
                    "Di URL",
                ],
                1,
                "Kode frontend bisa dibaca siapa pun; panggil API dari server.",
            ),
        ],
    ),
}

# (course title, module index) → list of exercises (inserted before the chapter quiz)
EXERCISES: dict[tuple[str, int], list[dict[str, Any]]] = {
    ("Dasar Pemrograman Python", 0): [
        {
            "title": "Latihan coding: perkenalan diri",
            "minutes": 8,
            "language": "python",
            "instructions": d("""
            Tulis program yang mencetak **tepat** dua baris berikut:

            ```text
            Halo, nama saya Siti
            Saya belajar Python di Yasun Studio
            ```
        """),
            "starter_code": "# Gunakan print() dua kali\n",
            "solution": 'print("Halo, nama saya Siti")\nprint("Saya belajar Python di Yasun Studio")\n',
            "hints": [
                "Setiap pemanggilan print() mencetak satu baris.",
                "Perhatikan huruf besar-kecil dan tanda koma.",
            ],
        }
    ],
    ("Dasar Pemrograman Python", 1): [
        {
            "title": "Latihan coding: kalkulator belanja",
            "minutes": 10,
            "language": "python",
            "instructions": d("""
            Sebuah kafe menjual kopi seharga `15000` per cangkir. Pelanggan membeli `3` cangkir
            dan mendapat diskon `10%`.

            Hitung total bayar lalu cetak dengan format:

            ```text
            Total: 40500
            ```

            Gunakan variabel `harga`, `jumlah`, dan `diskon`. Hasil akhir harus berupa bilangan bulat.
        """),
            "starter_code": "harga = 15000\njumlah = 3\ndiskon = 10  # persen\n\n# hitung total lalu cetak dengan f-string\n",
            "solution": 'harga = 15000\njumlah = 3\ndiskon = 10\n\nsubtotal = harga * jumlah\ntotal = subtotal - subtotal * diskon // 100\nprint(f"Total: {total}")\n',
            "hints": [
                "Hitung subtotal dulu: harga × jumlah.",
                "Gunakan // agar hasilnya bilangan bulat.",
                'Format output: print(f"Total: {total}")',
            ],
        }
    ],
    ("Dasar Pemrograman Python", 2): [
        {
            "title": "Latihan coding: FizzBuzz",
            "minutes": 12,
            "language": "python",
            "instructions": d("""
            Cetak angka **1 sampai 15**, satu per baris, dengan aturan:

            - kelipatan 3 → cetak `Fizz`
            - kelipatan 5 → cetak `Buzz`
            - kelipatan 3 **dan** 5 → cetak `FizzBuzz`
            - selain itu → cetak angkanya

            > [!TIP]
            > Periksa kondisi kelipatan 15 lebih dulu.
        """),
            "starter_code": "for i in range(1, 16):\n    # tulis logikamu di sini\n    pass\n",
            "solution": 'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)\n',
            "hints": [
                "Operator % menghasilkan sisa bagi.",
                "Urutan if itu penting: cek i % 15 lebih dulu.",
            ],
        }
    ],
    ("Dasar Pemrograman Python", 3): [
        {
            "title": "Latihan coding: rapor nilai",
            "minutes": 15,
            "language": "python",
            "instructions": d("""
            Buat fungsi `rata_rata(nilai)` yang mengembalikan rata-rata list angka dibulatkan
            **1 angka desimal**, dan fungsi `predikat(rata)` yang mengembalikan:

            | Rata-rata | Predikat |
            |---|---|
            | ≥ 85 | `A` |
            | ≥ 70 | `B` |
            | lainnya | `C` |

            Lalu cetak hasil untuk data `{"Budi": [80, 90, 75], "Rina": [95, 88, 92]}` dengan format:

            ```text
            Budi: 81.7 (B)
            Rina: 91.7 (A)
            ```
        """),
            "starter_code": 'def rata_rata(nilai):\n    ...\n\n\ndef predikat(rata):\n    ...\n\n\nkelas = {"Budi": [80, 90, 75], "Rina": [95, 88, 92]}\n',
            "solution": 'def rata_rata(nilai):\n    return round(sum(nilai) / len(nilai), 1)\n\n\ndef predikat(rata):\n    if rata >= 85:\n        return "A"\n    if rata >= 70:\n        return "B"\n    return "C"\n\n\nkelas = {"Budi": [80, 90, 75], "Rina": [95, 88, 92]}\nfor nama, nilai in kelas.items():\n    r = rata_rata(nilai)\n    print(f"{nama}: {r} ({predikat(r)})")\n',
            "hints": [
                "sum() dan len() membantu menghitung rata-rata.",
                "round(x, 1) membulatkan ke satu desimal.",
                "Gunakan kelas.items() untuk mendapatkan nama dan nilai sekaligus.",
            ],
        }
    ],
    ("JavaScript Modern untuk Pemula", 0): [
        {
            "title": "Latihan coding: template literal",
            "minutes": 8,
            "language": "javascript",
            "instructions": d("""
            Dengan `const nama = "Rina"` dan `const umur = 20`, cetak **tepat**:

            ```text
            Halo, Rina! Tahun depan kamu 21 tahun.
            ```

            Gunakan *template literal* (backtick) dan `console.log`.
        """),
            "starter_code": 'const nama = "Rina";\nconst umur = 20;\n\n// cetak kalimatnya di sini\n',
            "solution": 'const nama = "Rina";\nconst umur = 20;\n\nconsole.log(`Halo, ${nama}! Tahun depan kamu ${umur + 1} tahun.`);\n',
            "hints": [
                "Template literal memakai tanda backtick (`).",
                "Ekspresi ditulis di dalam ${ … }.",
            ],
        }
    ],
    ("JavaScript Modern untuk Pemula", 1): [
        {
            "title": "Latihan coding: olah data belanja",
            "minutes": 12,
            "language": "javascript",
            "instructions": d("""
            Dari array harga berikut, ambil hanya harga **di atas 10000**, tambahkan pajak 11%,
            lalu jumlahkan. Cetak hasilnya **dibulatkan** ke bilangan bulat:

            ```text
            96570
            ```

            Gunakan `filter`, `map`, dan `reduce` — tanpa perulangan `for`.
        """),
            "starter_code": "const harga = [12000, 45000, 8000, 30000];\n\n// filter → map → reduce\n",
            "solution": "const harga = [12000, 45000, 8000, 30000];\n\nconst total = harga\n  .filter((h) => h > 10000)\n  .map((h) => h * 1.11)\n  .reduce((sum, h) => sum + h, 0);\n\nconsole.log(Math.round(total));\n",
            "hints": [
                "filter((h) => h > 10000) menyisakan 12000, 45000, 30000.",
                "Gunakan Math.round() untuk membulatkan.",
            ],
        }
    ],
    ("JavaScript Modern untuk Pemula", 3): [
        {
            "title": "Latihan coding: async/await",
            "minutes": 12,
            "language": "javascript",
            "instructions": d("""
            Lengkapi fungsi `tunggu(ms)` agar mengembalikan Promise yang selesai setelah `ms`
            milidetik, lalu buat program yang mencetak:

            ```text
            Mengambil data...
            Data siap: 3 kelas
            ```

            Baris kedua harus tercetak **setelah** menunggu 300 ms.
        """),
            "starter_code": 'function tunggu(ms) {\n  // kembalikan Promise di sini\n}\n\nasync function main() {\n  console.log("Mengambil data...");\n  // tunggu 300 ms, lalu cetak hasilnya\n}\n\nmain();\n',
            "solution": 'function tunggu(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms));\n}\n\nasync function main() {\n  console.log("Mengambil data...");\n  await tunggu(300);\n  const kelas = ["Python", "JavaScript", "Git"];\n  console.log(`Data siap: ${kelas.length} kelas`);\n}\n\nmain();\n',
            "hints": [
                "new Promise((resolve) => setTimeout(resolve, ms))",
                "Jangan lupa await sebelum tunggu(300).",
            ],
        }
    ],
}

# Verified by running each solution (see tests/test_seed_content.py).
_EXPECTED_OUTPUT: dict[str, str] = {
    "Latihan coding: perkenalan diri": "Halo, nama saya Siti\nSaya belajar Python di Yasun Studio\n",
    "Latihan coding: kalkulator belanja": "Total: 40500\n",
    "Latihan coding: FizzBuzz": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
    "Latihan coding: rapor nilai": "Budi: 81.7 (B)\nRina: 91.7 (A)\n",
    "Latihan coding: template literal": "Halo, Rina! Tahun depan kamu 21 tahun.\n",
    "Latihan coding: olah data belanja": "96570\n",
    "Latihan coding: async/await": "Mengambil data...\nData siap: 3 kelas\n",
}
for _exercises in EXERCISES.values():
    for _ex in _exercises:
        _ex["expected_output"] = _EXPECTED_OUTPUT[_ex["title"]]
