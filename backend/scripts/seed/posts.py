"""Seed content — blog articles. (title, excerpt, tags, status, author_key, days_ago, markdown)."""

from textwrap import dedent as d

from app.modules.posts.models import PostStatus as S

POSTS: list[tuple[str, str, list[str], S, str, int, str]] = [
    (
        "Belajar Coding dari Nol: Mulai dari Mana?",
        "Peta jalan sederhana untuk kamu yang baru mau mulai belajar pemrograman — tanpa bingung memilih.",
        ["pemula", "roadmap"],
        S.PUBLISHED,
        "admin",
        88,
        d("""
            Banyak orang berhenti belajar coding bukan karena sulit, tetapi karena **bingung harus
            mulai dari mana**. Berikut peta jalan yang kami rekomendasikan.

            ## 1. Pilih satu bahasa dan setia
            Mulailah dengan **Python** atau **JavaScript**. Jangan berpindah-pindah bahasa di
            bulan pertama — konsep dasarnya sama, yang berbeda hanya sintaks.

            ## 2. Belajar 30 menit setiap hari
            Konsistensi mengalahkan intensitas. 30 menit setiap hari jauh lebih efektif daripada
            lima jam di akhir pekan.

            ## 3. Bangun proyek kecil secepatnya
            Kalkulator, to-do list, atau game tebak angka. Proyek memaksa kamu menggabungkan
            konsep dan menemukan masalah nyata.

            ## 4. Bergabung dengan komunitas
            Bertanya bukan tanda lemah. Developer senior pun bertanya setiap hari.

            > Kotak kuning di logo kami melambangkan *titik awal*. Setiap ahli pernah menjadi pemula.
            > **Dari nol, mulai praktik.**
        """),
    ),
    (
        "Kenapa Developer Perlu Memahami AI di 2026",
        "AI bukan pengganti developer — ia alat yang membuat developer jauh lebih produktif.",
        ["ai", "karier"],
        S.PUBLISHED,
        "dimas",
        74,
        d("""
            Dua tahun terakhir mengubah cara software dibuat. Asisten AI kini membantu menulis
            kode, menguji, hingga mendokumentasikan sistem.

            ## Yang berubah
            - Tugas repetitif (boilerplate, test sederhana) jauh lebih cepat
            - Fokus developer bergeser ke **desain sistem** dan **pemahaman bisnis**
            - Kemampuan menilai kualitas kode menjadi semakin penting

            ## Yang tidak berubah
            Fondasi tetap raja: struktur data, cara kerja web, database, dan keamanan. AI yang
            dipakai oleh developer tanpa fondasi justru menghasilkan bug yang sulit dilacak.

            ## Mulai dari mana?
            Ikuti kelas **Pengantar AI & Machine Learning** untuk memahami konsepnya, lalu
            gunakan AI sebagai rekan kerja — bukan pengganti berpikir.
        """),
    ),
    (
        "7 Kebiasaan Developer Pemula yang Cepat Berkembang",
        "Bukan soal bakat. Ini kebiasaan kecil yang membedakan pemula yang stagnan dan yang melesat.",
        ["pemula", "produktivitas"],
        S.PUBLISHED,
        "ayu",
        61,
        d("""
            1. **Membaca error message sampai habis** sebelum bertanya.
            2. **Menulis catatan belajar** — mengajarkan ulang adalah cara terbaik memahami.
            3. **Commit kecil dan sering** dengan pesan yang jelas.
            4. **Membaca kode orang lain** di GitHub.
            5. **Menyelesaikan proyek**, bukan hanya memulainya.
            6. **Meminta code review** dan menerimanya tanpa baper.
            7. **Istirahat cukup** — otak memproses materi baru saat tidur.

            Pilih satu kebiasaan minggu ini dan lakukan setiap hari.
        """),
    ),
    (
        "Python vs JavaScript: Mana yang Dipelajari Duluan?",
        "Perbandingan jujur dua bahasa paling populer untuk pemula, berdasarkan tujuan kariermu.",
        ["python", "javascript", "pemula"],
        S.PUBLISHED,
        "dimas",
        47,
        d("""
            | | Python | JavaScript |
            |---|---|---|
            | Kurva belajar | Sangat landai | Landai |
            | Kegunaan utama | Data, AI, otomasi, backend | Web frontend & backend |
            | Hasil visual cepat | Terminal | Langsung di browser |

            ## Pilih Python jika…
            kamu tertarik pada data, AI, atau ingin mengotomatisasi pekerjaan kantor.

            ## Pilih JavaScript jika…
            kamu ingin membuat website dan melihat hasil kerjamu langsung di browser.

            Kabar baiknya: setelah menguasai satu, bahasa kedua bisa dipelajari dalam hitungan minggu.
        """),
    ),
    (
        "Memahami Git dalam 10 Menit",
        "Konsep inti Git — commit, branch, merge — dijelaskan dengan analogi sehari-hari.",
        ["git", "tools"],
        S.PUBLISHED,
        "ayu",
        33,
        d("""
            Bayangkan Git sebagai **mesin waktu** untuk proyekmu.

            - **Commit** = menyimpan *checkpoint* seperti di game
            - **Branch** = dunia paralel untuk mencoba ide baru tanpa merusak yang utama
            - **Merge** = menggabungkan dunia paralel kembali ke cerita utama

            ```bash
            git switch -c ide-baru
            git commit -am "coba desain baru"
            git switch main && git merge ide-baru
            ```

            Ingin lebih dalam? Kelas **Git & GitHub untuk Kolaborasi** gratis untukmu.
        """),
    ),
    (
        "Cara Membaca Error Message Tanpa Panik",
        "Error bukan musuh. Pelajari cara membaca traceback dan menemukan akar masalah dengan sistematis.",
        ["debugging", "pemula"],
        S.PUBLISHED,
        "admin",
        19,
        d("""
            ```text
            Traceback (most recent call last):
              File "app.py", line 7, in <module>
                total = harga * jumlah
            TypeError: can't multiply sequence by non-int of type 'str'
            ```

            ## Baca dari bawah
            Baris terakhir memberi tahu **jenis** dan **penyebab** error. Di sini: kita mengalikan
            teks dengan teks — `jumlah` masih berupa string dari `input()`.

            ## Langkah sistematis
            1. Baca jenis error dan pesannya
            2. Lihat file dan nomor baris
            3. Cetak nilai variabel di sekitar baris itu
            4. Cari pesan error di dokumentasi resmi

            Setiap error yang berhasil kamu pecahkan adalah satu level naik. 🎮
        """),
    ),
    (
        "Membangun Portofolio Pertama sebagai Developer",
        "Tiga proyek yang membuat CV junior developer dilirik perekrut — plus cara menampilkannya.",
        ["karier", "portofolio"],
        S.PUBLISHED,
        "dimas",
        6,
        d("""
            Perekrut ingin melihat **bukti** kamu bisa membangun sesuatu.

            ## Tiga proyek yang kami sarankan
            1. **Aplikasi CRUD** dengan autentikasi (misalnya catatan keuangan)
            2. **Integrasi API pihak ketiga** (cuaca, peta, atau pembayaran sandbox)
            3. **Proyek yang menyelesaikan masalahmu sendiri** — ceritanya paling menarik saat wawancara

            ## Cara menampilkan
            - README yang jelas: masalah, solusi, teknologi, screenshot
            - Demo yang bisa diakses
            - Commit history yang rapi
        """),
    ),
    (
        "Roadmap Backend Developer 2027",
        "Draf: urutan belajar backend dari HTTP hingga observability.",
        ["backend", "roadmap"],
        S.DRAFT,
        "dimas",
        2,
        d("""
            *Draf — masih ditinjau tim editor.*

            1. HTTP & REST
            2. Satu bahasa backend (Python/FastAPI atau Node.js)
            3. SQL & desain database
            4. Autentikasi & keamanan
            5. Caching, antrian, dan observability
        """),
    ),
    (
        "Promo Kelas Ramadan 2026",
        "Pengumuman promo lama yang sudah berakhir.",
        ["pengumuman"],
        S.ARCHIVED,
        "admin",
        230,
        d("""
            Promo telah berakhir. Terima kasih atas antusiasme kalian!
        """),
    ),
]
