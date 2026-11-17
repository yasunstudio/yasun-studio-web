"""Learning design for seeded lessons: objectives per lesson and official resources per course."""

# lesson title → learning objectives ("Setelah materi ini kamu mampu…")
OBJECTIVES: dict[str, list[str]] = {
    # --- Python
    "Kenapa belajar Python?": [
        "Menjelaskan kegunaan Python di industri",
        "Menentukan tujuan belajarmu sendiri",
    ],
    "Instalasi Python & VS Code": [
        "Memasang Python 3 dan VS Code",
        "Memverifikasi instalasi lewat terminal",
    ],
    "Program pertamamu: Hello, World!": [
        "Menulis dan menjalankan file .py",
        "Menampilkan teks dengan print()",
    ],
    "Variabel dan aturan penamaan": [
        "Membuat dan mengubah nilai variabel",
        "Menerapkan konvensi snake_case",
    ],
    "String, angka, dan boolean": [
        "Membedakan tipe str, int, float, dan bool",
        "Memeriksa tipe data dengan type()",
    ],
    "Membaca input dari pengguna": [
        "Membaca input dengan input()",
        "Mengonversi teks menjadi angka",
        "Memakai f-string",
    ],
    "Percabangan if, elif, else": [
        "Menulis percabangan bertingkat",
        "Menjaga indentasi blok kode dengan benar",
    ],
    "Perulangan for dan while": [
        "Memilih for atau while sesuai kebutuhan",
        "Menggunakan range() dan break",
    ],
    "Latihan: game tebak angka": [
        "Menggabungkan input, percabangan, dan perulangan",
        "Memakai modul random",
    ],
    "Membuat fungsi sendiri": [
        "Mendefinisikan fungsi dengan parameter default",
        "Menambahkan type hint",
    ],
    "List dan dictionary": [
        "Menyimpan data berurutan dengan list",
        "Mengelola pasangan kunci–nilai dengan dict",
    ],
    "Proyek mini: aplikasi to-do di terminal": [
        "Merancang program utuh dari nol",
        "Menyimpan data ke file JSON",
    ],
    # --- JavaScript
    "Apa itu JavaScript?": [
        "Menjelaskan peran JavaScript bersama HTML & CSS",
        "Menjalankan kode di DevTools",
    ],
    "let, const, dan tipe data": [
        "Memilih const atau let dengan tepat",
        "Mengenali tipe data primitif",
    ],
    "Operator dan kondisi": [
        "Menggunakan operator perbandingan ketat (===)",
        "Menulis kondisi dan operator ternary",
    ],
    "Arrow function": [
        "Menulis arrow function dan parameter default",
        "Memahami kapan memakai arrow function",
    ],
    "map, filter, dan reduce": [
        "Mentransformasi array dengan map",
        "Menyaring dengan filter",
        "Mengakumulasi dengan reduce",
    ],
    "Objek dan destructuring": [
        "Mengakses properti objek",
        "Memakai destructuring dan spread operator",
    ],
    "Memilih dan mengubah elemen DOM": [
        "Memilih elemen dengan querySelector",
        "Mengubah teks dan class elemen",
    ],
    "Menangani event": [
        "Mendaftarkan event listener",
        "Mencegah perilaku bawaan dengan preventDefault()",
    ],
    "Proyek: penghitung interaktif": [
        "Membangun UI interaktif kecil",
        "Menyimpan state di localStorage",
    ],
    "Event loop dan Promise": [
        "Menjelaskan cara kerja event loop",
        "Memprediksi urutan eksekusi kode asinkron",
    ],
    "async/await dan fetch": [
        "Mengambil data dari API dengan fetch",
        "Menangani error dengan try/catch",
    ],
    "Proyek: aplikasi cuaca": [
        "Mengintegrasikan API publik",
        "Menampilkan status loading dan error",
    ],
    # --- Next.js
    "Kenapa Next.js?": [
        "Membandingkan Next.js dengan React murni",
        "Mengenali fitur bawaan Next.js",
    ],
    "create-next-app dan struktur proyek": [
        "Membuat proyek Next.js baru",
        "Memahami fungsi tiap folder utama",
    ],
    "Routing dengan App Router": ["Membuat route statis dan dinamis", "Memakai layout bersama"],
    "Server vs Client Components": [
        'Menentukan kapan memakai "use client"',
        "Mengurangi JavaScript yang dikirim ke browser",
    ],
    "Data fetching dan caching": [
        "Mengambil data di Server Component",
        "Mengatur revalidasi dan cache tag",
    ],
    "Loading dan error UI": [
        "Menambahkan loading.tsx dan error.tsx",
        "Meningkatkan pengalaman pengguna saat menunggu",
    ],
    "Server Actions untuk form": [
        "Memproses form dengan Server Actions",
        "Merevalidasi data setelah mutasi",
    ],
    "Validasi input dengan Zod": [
        "Mendefinisikan skema validasi",
        "Menampilkan pesan error per field",
    ],
    "Autentikasi dengan cookie httpOnly": [
        "Menyimpan sesi dengan aman",
        "Melindungi route dengan proxy",
    ],
    "Optimasi gambar dan font": [
        "Memakai next/image dan next/font",
        "Meningkatkan skor Core Web Vitals",
    ],
    "SEO dengan Metadata API": [
        "Menulis metadata statis dan dinamis",
        "Membuat sitemap dan robots",
    ],
    "Deploy dengan Docker": [
        "Mengaktifkan output standalone",
        "Menulis multi-stage Dockerfile untuk Next.js",
    ],
    # --- FastAPI
    "Kenalan dengan FastAPI": [
        "Menjelaskan keunggulan FastAPI",
        "Membuka dokumentasi otomatis di /docs",
    ],
    "Path dan query parameter": [
        "Mendefinisikan path dan query parameter bertipe",
        "Memahami validasi otomatis",
    ],
    "Model data dengan Pydantic": [
        "Membuat model request/response",
        "Menambahkan aturan validasi Field",
    ],
    "SQLAlchemy 2 async": ["Mendefinisikan model ORM dengan Mapped", "Menjalankan query async"],
    "Migrasi dengan Alembic": ["Membuat dan menjalankan migrasi", "Meninjau hasil autogenerate"],
    "Pola repository dan service": [
        "Memisahkan akses data dan logika bisnis",
        "Membuat kode yang mudah diuji",
    ],
    "Hashing password dengan Argon2": [
        "Menyimpan password secara aman",
        "Memverifikasi password saat login",
    ],
    "JWT dan refresh token": [
        "Menerbitkan access & refresh token",
        "Merotasi dan mencabut refresh token",
    ],
    "Role-based access control": [
        "Membatasi endpoint berdasarkan peran",
        "Menulis dependency otorisasi",
    ],
    "Testing dengan pytest": ["Menulis test endpoint async", "Menjalankan test secara otomatis"],
    "Caching dan rate limiting dengan Redis": [
        "Meng-cache data yang sering dibaca",
        "Membatasi percobaan login",
    ],
    "Deploy dengan Docker Compose": [
        "Menyusun stack API + DB + Redis",
        "Menambahkan healthcheck dan migrasi otomatis",
    ],
    # --- Git
    "Kenapa butuh version control?": [
        "Menjelaskan manfaat version control",
        "Mengenali alur kerja Git",
    ],
    "init, add, dan commit": ["Membuat repository baru", "Menulis pesan commit yang jelas"],
    "Membaca riwayat perubahan": [
        "Melihat riwayat dengan git log",
        "Membandingkan perubahan dengan git diff",
    ],
    "Branch dan merge": ["Membuat dan berpindah branch", "Menggabungkan branch ke main"],
    "Menyelesaikan konflik": [
        "Membaca penanda konflik",
        "Menyelesaikan konflik merge dengan benar",
    ],
    "Rebase dengan aman": ["Membedakan merge dan rebase", "Menerapkan aturan emas rebase"],
    "Remote, push, dan pull": [
        "Menghubungkan repository ke GitHub",
        "Sinkronisasi dengan push dan pull",
    ],
    "Pull request dan code review": [
        "Membuat pull request yang baik",
        "Memberi dan menerima code review",
    ],
    "Otomatisasi dengan GitHub Actions": [
        "Menulis workflow CI sederhana",
        "Menjalankan test otomatis setiap push",
    ],
    # --- SQL
    "Apa itu database relasional?": [
        "Menjelaskan tabel, baris, dan kolom",
        "Memahami primary & foreign key",
    ],
    "Menjalankan PostgreSQL dengan Docker": [
        "Menjalankan PostgreSQL di container",
        "Terhubung dengan psql",
    ],
    "Query SELECT pertama": ["Mengambil data dengan SELECT", "Memilih kolom tertentu"],
    "Filter, urutkan, dan batasi": [
        "Menyaring data dengan WHERE",
        "Mengurutkan dan membatasi hasil",
    ],
    "JOIN antar tabel": ["Menggabungkan tabel dengan JOIN", "Membedakan INNER dan LEFT JOIN"],
    "GROUP BY dan agregasi": [
        "Menghitung dengan COUNT, SUM, AVG",
        "Menyaring kelompok dengan HAVING",
    ],
    "Desain skema dan normalisasi": [
        "Merancang tabel yang ternormalisasi",
        "Menerapkan constraint",
    ],
    "Index dan EXPLAIN": ["Membuat index yang tepat", "Membaca rencana eksekusi query"],
    "Transaksi dan konsistensi data": ["Memakai BEGIN/COMMIT/ROLLBACK", "Menjelaskan prinsip ACID"],
    # --- Docker
    "Container vs virtual machine": [
        "Membedakan container dan VM",
        "Menjelaskan manfaat container",
    ],
    "Image dan container": [
        "Menarik image dan menjalankan container",
        "Mengelola container yang berjalan",
    ],
    "Menulis Dockerfile pertama": ["Menulis Dockerfile sederhana", "Membangun image sendiri"],
    "Volume dan network": ["Menyimpan data dengan volume", "Menghubungkan container lewat network"],
    "Docker Compose": [
        "Menjalankan beberapa service sekaligus",
        "Mengatur dependensi antar service",
    ],
    "Multi-stage build": ["Memisahkan tahap build dan runtime", "Memperkecil ukuran image"],
    "Keamanan image": [
        "Menjalankan container sebagai non-root",
        "Menghindari secret di dalam image",
    ],
    "Healthcheck dan restart policy": ["Menambahkan healthcheck", "Mengatur restart policy"],
    "Proyek: kontainerisasi aplikasi full-stack": [
        "Mengemas aplikasi multi-service",
        "Menyiapkan konfigurasi dengan .env",
    ],
    # --- AI
    "AI, machine learning, dan deep learning": [
        "Membedakan AI, ML, dan deep learning",
        "Mengenali contoh penerapannya",
    ],
    "Jenis-jenis machine learning": [
        "Membedakan supervised, unsupervised, reinforcement",
        "Memilih pendekatan yang sesuai",
    ],
    "Menyiapkan Jupyter Notebook": [
        "Memasang JupyterLab dan library data",
        "Menjalankan notebook pertama",
    ],
    "Eksplorasi data dengan pandas": [
        "Membaca dan meringkas dataset",
        "Mengelompokkan data dengan groupby",
    ],
    "Regresi linear dengan scikit-learn": [
        "Melatih model regresi linear",
        "Membuat prediksi dari model",
    ],
    "Mengevaluasi model": ["Memisahkan data latih dan uji", "Mengenali overfitting"],
    "Bagaimana LLM bekerja?": [
        "Menjelaskan prediksi token berikutnya",
        "Memahami keterbatasan LLM",
    ],
    "Prompt engineering": [
        "Menyusun prompt dengan peran, konteks, dan format",
        "Memberi contoh dalam prompt",
    ],
    "Proyek: chatbot sederhana": [
        "Memanggil API LLM dengan aman",
        "Menampilkan jawaban secara streaming",
    ],
}

# course title → official, stable learning resources
RESOURCES: dict[str, list[dict[str, str]]] = {
    "Dasar Pemrograman Python": [
        {"title": "Dokumentasi resmi Python", "url": "https://docs.python.org/3/", "kind": "docs"},
        {
            "title": "The Python Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "kind": "docs",
        },
        {"title": "Visual Studio Code", "url": "https://code.visualstudio.com/", "kind": "tool"},
    ],
    "JavaScript Modern untuk Pemula": [
        {
            "title": "MDN: JavaScript Guide",
            "url": "https://developer.mozilla.org/docs/Web/JavaScript/Guide",
            "kind": "docs",
        },
        {
            "title": "MDN: Using Fetch",
            "url": "https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch",
            "kind": "docs",
        },
        {"title": "Open-Meteo API", "url": "https://open-meteo.com/", "kind": "tool"},
    ],
    "Web Modern dengan Next.js": [
        {"title": "Dokumentasi Next.js", "url": "https://nextjs.org/docs", "kind": "docs"},
        {"title": "Dokumentasi React", "url": "https://react.dev/", "kind": "docs"},
        {"title": "Zod", "url": "https://zod.dev/", "kind": "docs"},
    ],
    "REST API Profesional dengan FastAPI": [
        {"title": "Dokumentasi FastAPI", "url": "https://fastapi.tiangolo.com/", "kind": "docs"},
        {"title": "SQLAlchemy 2.x", "url": "https://docs.sqlalchemy.org/", "kind": "docs"},
        {
            "title": "OWASP Password Storage Cheat Sheet",
            "url": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
            "kind": "article",
        },
    ],
    "Git & GitHub untuk Kolaborasi": [
        {"title": "Pro Git (buku gratis)", "url": "https://git-scm.com/book/en/v2", "kind": "docs"},
        {"title": "GitHub Docs", "url": "https://docs.github.com/", "kind": "docs"},
        {
            "title": "Conventional Commits",
            "url": "https://www.conventionalcommits.org/",
            "kind": "article",
        },
    ],
    "SQL & PostgreSQL dari Nol": [
        {
            "title": "Dokumentasi PostgreSQL",
            "url": "https://www.postgresql.org/docs/",
            "kind": "docs",
        },
        {
            "title": "PostgreSQL Tutorial (resmi)",
            "url": "https://www.postgresql.org/docs/current/tutorial.html",
            "kind": "docs",
        },
    ],
    "Docker untuk Developer": [
        {"title": "Dokumentasi Docker", "url": "https://docs.docker.com/", "kind": "docs"},
        {
            "title": "Dockerfile best practices",
            "url": "https://docs.docker.com/build/building/best-practices/",
            "kind": "article",
        },
    ],
    "Pengantar AI & Machine Learning": [
        {
            "title": "scikit-learn User Guide",
            "url": "https://scikit-learn.org/stable/user_guide.html",
            "kind": "docs",
        },
        {
            "title": "pandas Getting Started",
            "url": "https://pandas.pydata.org/docs/getting_started/",
            "kind": "docs",
        },
        {
            "title": "Google Machine Learning Crash Course",
            "url": "https://developers.google.com/machine-learning/crash-course",
            "kind": "video",
        },
    ],
}
