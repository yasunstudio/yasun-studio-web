"""Seed content — programming fundamentals: Python, JavaScript, Git."""

from textwrap import dedent as d

from scripts.seed.types import A, CourseSeed, L, V

PYTHON = CourseSeed(
    title="Dasar Pemrograman Python",
    summary="Dari nol: variabel, percabangan, perulangan, fungsi, hingga proyek CLI pertamamu dengan Python.",
    category="Programming",
    level=L.BEGINNER,
    tags=["python", "dasar", "pemula"],
    price=0,
    is_featured=True,
    video="https://www.youtube.com/watch?v=rfscVS0vtbw",
    created_days_ago=120,
    description=d("""
        Python adalah bahasa yang paling ramah untuk pemula — sintaksnya bersih, komunitasnya
        besar, dan dipakai mulai dari otomasi, web, hingga AI. Kelas ini membawamu dari
        **belum pernah ngoding** sampai mampu membuat program kecil yang benar-benar berguna.

        ## Yang akan kamu pelajari
        - Menyiapkan Python dan VS Code di laptopmu
        - Variabel, tipe data, dan input dari pengguna
        - Logika program: percabangan dan perulangan
        - Fungsi, list, dan dictionary
        - Proyek akhir: aplikasi to-do berbasis terminal

        ## Untuk siapa kelas ini?
        Siswa, mahasiswa, atau profesional non-IT yang ingin mulai belajar pemrograman.

        ## Prasyarat
        Tidak ada. Cukup laptop (Windows, macOS, atau Linux) dan rasa ingin tahu.
    """),
    modules=[
        (
            "Bab 1 · Mengenal Python",
            [
                (
                    "Kenapa belajar Python?",
                    V,
                    8,
                    True,
                    d("""
                Python dipakai oleh Instagram, NASA, hingga ribuan startup. Di video ini kita
                membahas kenapa Python cocok sebagai bahasa pertama dan apa saja yang bisa kamu
                bangun setelah menguasainya.

                **Poin penting**
                - Sintaks dekat dengan bahasa manusia
                - Ekosistem library yang sangat luas (web, data, AI)
                - Permintaan kerja yang tinggi di Indonesia
            """),
                ),
                (
                    "Instalasi Python & VS Code",
                    A,
                    12,
                    True,
                    d("""
                ## Langkah instalasi
                1. Unduh Python 3 terbaru dari **python.org** dan centang *Add Python to PATH*.
                2. Pasang **Visual Studio Code**, lalu tambahkan ekstensi *Python* dari Microsoft.
                3. Buka terminal dan cek versinya:

                ```bash
                python --version
                ```

                Jika muncul `Python 3.x.x`, instalasi berhasil. 🎉

                > **Latihan:** buat folder `belajar-python` dan buka di VS Code.
            """),
                ),
                (
                    "Program pertamamu: Hello, World!",
                    A,
                    10,
                    False,
                    d("""
                Buat file `halo.py` lalu tulis:

                ```python
                print("Halo, dunia!")
                print("Saya sedang belajar Python di Yasun Studio")
                ```

                Jalankan dengan `python halo.py`. Fungsi `print()` menampilkan teks ke layar —
                inilah cara paling sederhana program "berbicara" kepada kita.

                > **Latihan:** cetak nama dan kota asalmu dalam dua baris.
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Variabel & Tipe Data",
            [
                (
                    "Variabel dan aturan penamaan",
                    A,
                    12,
                    False,
                    d("""
                Variabel adalah "wadah" untuk menyimpan data.

                ```python
                nama = "Siti"
                umur = 21
                tinggi = 1.62
                ```

                **Aturan penamaan:** huruf kecil, pisahkan kata dengan `_` (snake_case), tidak
                boleh diawali angka, dan hindari kata kunci seperti `for` atau `class`.

                > **Latihan:** buat variabel `harga_kopi` dan `jumlah_cangkir`, lalu hitung totalnya.
            """),
                ),
                (
                    "String, angka, dan boolean",
                    V,
                    15,
                    False,
                    d("""
                Tiga tipe data dasar yang akan kamu pakai setiap hari:

                | Tipe | Contoh | Kegunaan |
                |---|---|---|
                | `str` | `"Python"` | Teks |
                | `int` / `float` | `42`, `3.14` | Angka |
                | `bool` | `True`, `False` | Kondisi ya/tidak |

                Gunakan `type()` untuk mengecek tipe sebuah nilai.
            """),
                ),
                (
                    "Membaca input dari pengguna",
                    A,
                    10,
                    False,
                    d("""
                ```python
                nama = input("Siapa namamu? ")
                umur = int(input("Berapa umurmu? "))
                print(f"Halo {nama}, tahun depan kamu berumur {umur + 1} tahun.")
                ```

                `input()` selalu menghasilkan **string**, jadi ubah dengan `int()` atau
                `float()` bila perlu berhitung. Perhatikan juga *f-string* untuk menyisipkan
                variabel ke dalam teks.
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Logika & Perulangan",
            [
                (
                    "Percabangan if, elif, else",
                    A,
                    15,
                    False,
                    d("""
                ```python
                nilai = 82

                if nilai >= 85:
                    print("A")
                elif nilai >= 70:
                    print("B")
                else:
                    print("Perlu belajar lagi")
                ```

                Python memakai **indentasi** (4 spasi) untuk menandai blok kode. Salah indentasi
                adalah error paling umum bagi pemula — biasakan dari awal!
            """),
                ),
                (
                    "Perulangan for dan while",
                    V,
                    18,
                    False,
                    d("""
                - `for` — mengulang sebanyak elemen pada sebuah koleksi
                - `while` — mengulang selama kondisi bernilai `True`

                ```python
                for i in range(1, 6):
                    print("Langkah ke-", i)

                saldo = 100_000
                while saldo > 0:
                    saldo -= 30_000
                ```
            """),
                ),
                (
                    "Latihan: game tebak angka",
                    A,
                    20,
                    False,
                    d("""
                Gabungkan semua yang sudah dipelajari:

                ```python
                import random

                rahasia = random.randint(1, 10)
                while True:
                    tebakan = int(input("Tebak angka 1–10: "))
                    if tebakan == rahasia:
                        print("Benar! 🎉")
                        break
                    print("Terlalu kecil" if tebakan < rahasia else "Terlalu besar")
                ```

                > **Tantangan:** batasi pemain hanya 3 kali kesempatan.
            """),
                ),
            ],
        ),
        (
            "Bab 4 · Fungsi & Struktur Data",
            [
                (
                    "Membuat fungsi sendiri",
                    A,
                    15,
                    False,
                    d("""
                Fungsi membuat kode bisa dipakai ulang dan mudah dibaca.

                ```python
                def hitung_diskon(harga: int, persen: int = 10) -> int:
                    return harga - harga * persen // 100

                print(hitung_diskon(50_000))      # 45000
                print(hitung_diskon(50_000, 25))  # 37500
                ```

                Perhatikan *parameter default* dan *type hint* — kebiasaan baik developer profesional.
            """),
                ),
                (
                    "List dan dictionary",
                    A,
                    18,
                    False,
                    d("""
                ```python
                belanja = ["kopi", "gula", "susu"]
                belanja.append("roti")

                siswa = {"nama": "Budi", "kelas": "Python", "nilai": 88}
                print(siswa["nama"])
                ```

                **List** untuk data berurutan, **dictionary** untuk pasangan kunci–nilai. Keduanya
                adalah fondasi hampir semua program Python.
            """),
                ),
                (
                    "Proyek mini: aplikasi to-do di terminal",
                    A,
                    30,
                    False,
                    d("""
                Saatnya membangun aplikasi utuh! Fitur minimal:

                1. Tambah tugas
                2. Lihat semua tugas
                3. Tandai tugas selesai
                4. Simpan ke file `todo.json` agar tidak hilang

                ```python
                import json, pathlib

                FILE = pathlib.Path("todo.json")
                tugas = json.loads(FILE.read_text()) if FILE.exists() else []
                ```

                Unggah hasilnya ke GitHub — ini akan jadi portofolio pertamamu. 💪
            """),
                ),
            ],
        ),
    ],
)

JAVASCRIPT = CourseSeed(
    title="JavaScript Modern untuk Pemula",
    summary="Kuasai JavaScript ES2024: fungsi, array, DOM, event, hingga async/await dan fetch API.",
    category="Web Development",
    level=L.BEGINNER,
    tags=["javascript", "web", "frontend"],
    price=0,
    is_featured=False,
    video="https://www.youtube.com/watch?v=PkZNo7MFNFg",
    created_days_ago=105,
    description=d("""
        JavaScript adalah bahasa yang menghidupkan setiap website. Di kelas ini kamu belajar
        JavaScript **modern** — bukan cara lama — sehingga siap melanjutkan ke React atau Next.js.

        ## Yang akan kamu pelajari
        - `let`, `const`, tipe data, dan operator
        - Arrow function serta method array `map`, `filter`, `reduce`
        - Memanipulasi DOM dan menangani event
        - Promise, `async/await`, dan mengambil data dengan `fetch`
        - Proyek: aplikasi cuaca yang memanggil API publik

        ## Prasyarat
        Pemahaman dasar HTML. Pengalaman pemrograman lain akan membantu, tapi tidak wajib.
    """),
    modules=[
        (
            "Bab 1 · Fondasi JavaScript",
            [
                (
                    "Apa itu JavaScript?",
                    V,
                    10,
                    True,
                    d("""
                JavaScript berjalan di browser **dan** di server (Node.js). Video ini mengenalkan
                peran JavaScript bersama HTML dan CSS, serta cara menjalankannya lewat DevTools.
            """),
                ),
                (
                    "let, const, dan tipe data",
                    A,
                    12,
                    True,
                    d("""
                ```js
                const nama = "Rina";      // tidak bisa di-assign ulang
                let skor = 0;             // bisa berubah
                skor += 10;

                typeof nama;  // "string"
                typeof skor;  // "number"
                ```

                Aturan praktis: **gunakan `const` secara default**, `let` hanya bila nilainya
                memang berubah. Hindari `var`.
            """),
                ),
                (
                    "Operator dan kondisi",
                    A,
                    14,
                    False,
                    d("""
                ```js
                const umur = 19;
                const status = umur >= 17 ? "dewasa" : "anak";

                if (status === "dewasa" && umur < 21) {
                  console.log("Selamat datang, mahasiswa baru!");
                }
                ```

                Selalu gunakan `===` (strict equality) — `==` melakukan konversi tipe yang sering
                menimbulkan bug.
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Fungsi, Array & Objek",
            [
                (
                    "Arrow function",
                    A,
                    12,
                    False,
                    d("""
                ```js
                const luasPersegi = (sisi) => sisi * sisi;
                const sapa = (nama = "teman") => `Halo, ${nama}!`;
                ```

                Arrow function lebih ringkas dan tidak memiliki `this` sendiri — sangat cocok
                untuk callback.
            """),
                ),
                (
                    "map, filter, dan reduce",
                    V,
                    18,
                    False,
                    d("""
                ```js
                const harga = [12000, 45000, 8000, 30000];

                const pajak   = harga.map((h) => h * 1.11);
                const mahal   = harga.filter((h) => h > 20000);
                const total   = harga.reduce((sum, h) => sum + h, 0);
                ```

                Tiga method ini menggantikan sebagian besar perulangan `for` dan membuat kode
                lebih deklaratif.
            """),
                ),
                (
                    "Objek dan destructuring",
                    A,
                    14,
                    False,
                    d("""
                ```js
                const user = { nama: "Andi", kota: "Bandung", skill: ["JS", "CSS"] };
                const { nama, kota } = user;
                const salinan = { ...user, kota: "Jakarta" };
                ```

                *Destructuring* dan *spread operator* akan sering kamu temui di React.
            """),
                ),
            ],
        ),
        (
            "Bab 3 · DOM & Event",
            [
                (
                    "Memilih dan mengubah elemen DOM",
                    A,
                    14,
                    False,
                    d("""
                ```js
                const judul = document.querySelector("h1");
                judul.textContent = "Belajar DOM itu seru!";
                judul.classList.add("text-highlight");
                ```

                DOM adalah representasi halaman HTML yang bisa diubah oleh JavaScript.
            """),
                ),
                (
                    "Menangani event",
                    A,
                    14,
                    False,
                    d("""
                ```js
                const tombol = document.querySelector("#beli");
                tombol.addEventListener("click", (event) => {
                  event.preventDefault();
                  alert("Terima kasih sudah membeli!");
                });
                ```
            """),
                ),
                (
                    "Proyek: penghitung interaktif",
                    A,
                    25,
                    False,
                    d("""
                Bangun aplikasi counter dengan tombol **+**, **−**, dan **reset**, lalu simpan
                nilainya di `localStorage` agar tetap ada setelah halaman dimuat ulang.

                > **Tantangan:** ubah warna angka menjadi merah bila nilainya negatif.
            """),
                ),
            ],
        ),
        (
            "Bab 4 · JavaScript Asinkron",
            [
                (
                    "Event loop dan Promise",
                    V,
                    20,
                    False,
                    d("""
                Memahami event loop adalah kunci untuk menulis JavaScript asinkron tanpa bingung.
                Setelah video, coba prediksi urutan output kode berikut:

                ```js
                console.log("1");
                setTimeout(() => console.log("2"), 0);
                Promise.resolve().then(() => console.log("3"));
                console.log("4");
                ```
            """),
                ),
                (
                    "async/await dan fetch",
                    A,
                    16,
                    False,
                    d("""
                ```js
                async function ambilPengguna() {
                  try {
                    const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.json();
                  } catch (err) {
                    console.error("Gagal mengambil data:", err);
                  }
                }
                ```

                Selalu tangani error dan cek `res.ok` — `fetch` tidak melempar error untuk 404/500.
            """),
                ),
                (
                    "Proyek: aplikasi cuaca",
                    A,
                    35,
                    False,
                    d("""
                Gunakan API publik **Open-Meteo** (tanpa API key) untuk menampilkan suhu kota
                pilihan pengguna. Fitur:

                1. Input nama kota
                2. Tampilkan suhu dan kondisi cuaca
                3. Indikator *loading* dan pesan error yang ramah
            """),
                ),
            ],
        ),
    ],
)

GIT = CourseSeed(
    title="Git & GitHub untuk Kolaborasi",
    summary="Kelola versi kode dengan Git, bekerja dalam tim lewat branch dan pull request di GitHub.",
    category="Tools",
    level=L.BEGINNER,
    tags=["git", "github", "kolaborasi"],
    price=0,
    is_featured=False,
    video="https://www.youtube.com/watch?v=RGOj5yH7evk",
    created_days_ago=90,
    description=d("""
        Tidak ada developer profesional yang bekerja tanpa Git. Kelas singkat ini mengajarkan
        alur kerja yang dipakai tim software di seluruh dunia.

        ## Yang akan kamu pelajari
        - Konsep version control, commit, dan riwayat perubahan
        - Branch, merge, dan menyelesaikan konflik
        - Remote repository, pull request, dan code review
        - Dasar otomatisasi dengan GitHub Actions

        ## Prasyarat
        Terbiasa memakai terminal dasar (pindah folder, membuat file).
    """),
    modules=[
        (
            "Bab 1 · Dasar Version Control",
            [
                (
                    "Kenapa butuh version control?",
                    V,
                    9,
                    True,
                    d("""
                Pernah punya file `skripsi_final_revisi3_FIX.docx`? Git menyelesaikan masalah itu
                untuk kode — setiap perubahan tercatat dan bisa dikembalikan kapan saja.
            """),
                ),
                (
                    "init, add, dan commit",
                    A,
                    14,
                    True,
                    d("""
                ```bash
                git init
                git add index.html
                git commit -m "feat: tambah halaman beranda"
                ```

                Tulis pesan commit yang jelas. Konvensi populer: `feat:`, `fix:`, `docs:`,
                `refactor:`.
            """),
                ),
                (
                    "Membaca riwayat perubahan",
                    A,
                    10,
                    False,
                    d("""
                ```bash
                git log --oneline --graph
                git diff HEAD~1
                git show <hash-commit>
                ```
            """),
                ),
            ],
        ),
        (
            "Bab 2 · Branching",
            [
                (
                    "Branch dan merge",
                    A,
                    15,
                    False,
                    d("""
                ```bash
                git switch -c fitur/login
                # ... kerjakan fitur ...
                git switch main
                git merge fitur/login
                ```

                Satu branch untuk satu fitur membuat pekerjaan paralel tetap rapi.
            """),
                ),
                (
                    "Menyelesaikan konflik",
                    A,
                    16,
                    False,
                    d("""
                Konflik terjadi bila dua branch mengubah baris yang sama. Git akan menandai:

                ```text
                <<<<<<< HEAD
                Judul versi main
                =======
                Judul versi fitur
                >>>>>>> fitur/login
                ```

                Pilih versi yang benar, hapus penanda, lalu `git add` dan `git commit`.
            """),
                ),
                (
                    "Rebase dengan aman",
                    A,
                    12,
                    False,
                    d("""
                `git rebase main` menata ulang commit agar riwayat linear. Aturan emas:
                **jangan me-rebase branch yang sudah dipakai orang lain.**
            """),
                ),
            ],
        ),
        (
            "Bab 3 · Bekerja dengan GitHub",
            [
                (
                    "Remote, push, dan pull",
                    A,
                    12,
                    False,
                    d("""
                ```bash
                git remote add origin git@github.com:kamu/proyek.git
                git push -u origin main
                git pull --rebase
                ```
            """),
                ),
                (
                    "Pull request dan code review",
                    V,
                    18,
                    False,
                    d("""
                Pull request adalah tempat tim berdiskusi sebelum kode digabung. Tips PR yang baik:
                kecil, satu tujuan, deskripsi jelas, dan sertakan screenshot untuk perubahan UI.
            """),
                ),
                (
                    "Otomatisasi dengan GitHub Actions",
                    A,
                    15,
                    False,
                    d("""
                ```yaml
                name: CI
                on: [push, pull_request]
                jobs:
                  test:
                    runs-on: ubuntu-latest
                    steps:
                      - uses: actions/checkout@v4
                      - run: npm ci && npm test
                ```

                Setiap push kini otomatis diuji — kualitas kode terjaga tanpa usaha ekstra.
            """),
                ),
            ],
        ),
    ],
)
