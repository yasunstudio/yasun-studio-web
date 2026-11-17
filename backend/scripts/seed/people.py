"""Seed people & inbox. Demo accounts use the reserved example.com domain."""

from app.modules.users.models import UserRole

DEMO_PASSWORD_STAFF = "Editor123!"
DEMO_PASSWORD_LEARNER = "Pelajar123!"

# key, full name, email, role, joined_days_ago
STAFF = [
    ("dimas", "Dimas Pratama", "dimas@example.com", UserRole.EDITOR, 150),
    ("ayu", "Ayu Lestari", "ayu@example.com", UserRole.EDITOR, 130),
]

# full name, email, joined_days_ago, is_active
LEARNERS = [
    ("Siti Nurhaliza", "siti@example.com", 70, True),
    ("Budi Santoso", "budi@example.com", 86, True),
    ("Andi Wijaya", "andi@example.com", 81, True),
    ("Rina Kartika", "rina@example.com", 77, True),
    ("Fajar Nugroho", "fajar@example.com", 73, True),
    ("Dewi Anggraini", "dewi@example.com", 66, True),
    ("Rizky Ramadhan", "rizky@example.com", 62, True),
    ("Putri Maharani", "putri@example.com", 58, True),
    ("Agus Setiawan", "agus@example.com", 55, True),
    ("Nadia Safitri", "nadia@example.com", 51, True),
    ("Hendra Gunawan", "hendra@example.com", 47, False),  # deactivated account
    ("Larasati Wulandari", "laras@example.com", 44, True),
    ("Bayu Saputra", "bayu@example.com", 40, True),
    ("Citra Permata", "citra@example.com", 36, True),
    ("Yoga Prasetyo", "yoga@example.com", 31, True),
    ("Intan Purnamasari", "intan@example.com", 27, True),
    ("Eko Susanto", "eko@example.com", 23, True),
    ("Maya Sari", "maya@example.com", 19, True),
    ("Taufik Hidayat", "taufik@example.com", 15, True),
    ("Wulan Dari", "wulan@example.com", 11, True),
    ("Arief Rahman", "arief@example.com", 8, True),
    ("Sekar Ayu", "sekar@example.com", 5, True),
    ("Galih Pratama", "galih@example.com", 3, True),
    ("Nurul Aini", "nurul@example.com", 1, True),
]

# The flagship demo learner: a complete, realistic journey.
# course title → (fraction of lessons completed, days since enrolment, days since last access)
SITI_JOURNEY = {
    "Dasar Pemrograman Python": (1.0, 65, 20),
    "JavaScript Modern untuk Pemula": (0.58, 38, 1),
    "Git & GitHub untuk Kolaborasi": (0.34, 14, 3),
    "Pengantar AI & Machine Learning": (0.0, 2, 2),
}

# name, email, subject, message, days_ago, is_read
MESSAGES = [
    (
        "Rahmat Hidayat",
        "rahmat.h@example.com",
        "Kerja sama pelatihan karyawan",
        "Halo tim Yasun Studio, kami dari PT Maju Digital tertarik mengadakan pelatihan Python untuk 20 karyawan. "
        "Apakah tersedia paket korporat dan sertifikat? Terima kasih.",
        1,
        False,
    ),
    (
        "Lina Marlina",
        "lina.m@example.com",
        "Pembayaran kelas Next.js",
        "Saya ingin membeli kelas Web Modern dengan Next.js. Kapan pembayaran online tersedia? Apakah bisa transfer bank?",
        2,
        False,
    ),
    (
        "Joko Susilo",
        "joko.s@example.com",
        "Materi tidak bisa diputar",
        "Video di materi 'Event loop dan Promise' tidak bisa diputar di HP saya (Android, Chrome). Mohon dicek.",
        3,
        False,
    ),
    (
        "Sari Indah",
        "sari.i@example.com",
        "Usulan kelas baru: Flutter",
        "Terima kasih atas kelas-kelasnya! Apakah ada rencana membuat kelas Flutter atau mobile development?",
        6,
        True,
    ),
    (
        "Kevin Tanoto",
        "kevin.t@example.com",
        "Sertifikat kelas Python",
        "Saya sudah menyelesaikan kelas Dasar Pemrograman Python. Bagaimana cara mendapatkan sertifikatnya?",
        9,
        True,
    ),
    (
        "Mega Puspita",
        "mega.p@example.com",
        "Diskon pelajar",
        "Apakah ada diskon khusus untuk mahasiswa? Saya mahasiswa semester 3 jurusan Sistem Informasi.",
        13,
        True,
    ),
    (
        "Doni Kurniawan",
        "doni.k@example.com",
        "Undangan mengisi webinar kampus",
        "Kami dari Himpunan Mahasiswa Informatika ingin mengundang Yasun Studio mengisi webinar 'Karier di Era AI'.",
        18,
        True,
    ),
    (
        "Fitri Handayani",
        "fitri.h@example.com",
        "Terima kasih!",
        "Berkat kelas SQL & PostgreSQL saya lolos tes teknis magang. Terima kasih banyak tim Yasun Studio! 🙏",
        25,
        True,
    ),
]
