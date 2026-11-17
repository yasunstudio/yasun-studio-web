# Deploy ke Synology NAS (yasun-studio-nas)

Panduan menjalankan Yasun Studio di Docker (Container Manager) pada NAS Synology, dengan akses
publik lewat **Cloudflare Tunnel**. Pasangannya: [cloudflare.md](cloudflare.md).

## 1. Arsitektur

```
Pengunjung ──HTTPS──▶ Cloudflare (DNS, SSL, WAF, cache)
                            ▲
                            │  koneksi KELUAR dari NAS (tanpa port-forward router)
┌───────────────────────── NAS · Container Manager ─────────────────────────┐
│ cloudflared ─▶ gateway (nginx) ─┬─▶ frontend (Next.js)                     │
│                                 └─▶ backend (FastAPI) ─▶ db (PostgreSQL)   │
│                                                        └─▶ redis           │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Tidak ada yang di-build di NAS.** GitHub Actions membangun image `backend`, `frontend`, dan
  `gateway` lalu menyimpannya di GitHub Container Registry (GHCR); NAS hanya menarik (pull).
- **Tidak ada port yang dibuka ke internet.** Router tidak perlu port-forward; DSM tetap tertutup.
- Data (database, Redis, backup) disimpan sebagai folder biasa di NAS sehingga bisa di-snapshot
  dan di-backup dengan Hyper Backup.

## 2. Data NAS (isi oleh admin)

| Item | Nilai |
|---|---|
| Model NAS | `__________` (mis. DS923+) |
| Arsitektur CPU | `__________` (x86_64 / ARM64 — cek di Info Center) |
| RAM | `__________` (min. 2 GB, disarankan 4 GB+) |
| Versi DSM | `__________` (wajib 7.2 atau lebih baru) |
| IP LAN NAS | `__________` |
| Volume | `/volume1` (ubah jika berbeda) |
| Folder aplikasi | `/volume1/docker/yasun-studio` |
| User DSM admin untuk SSH | `__________` |
| Domain publik | `__________` (mis. yasunstudio.com) |
| Repo GitHub | https://github.com/yasunstudio/yasun-studio-web |

> **NAS ARM?** Image dibangun untuk `linux/amd64` secara default. Untuk NAS ARM64, set variabel
> repository `PLATFORMS=linux/amd64,linux/arm64` (langkah 5).

## 3. Prasyarat di NAS

1. **DSM 7.2+** — Control Panel → Update & Restore.
2. **Container Manager** — Package Center → instal *Container Manager*.
   Saat instalasi, Synology otomatis membuat shared folder **`docker`**.
3. **SSH** (sementara, untuk setup) — Control Panel → Terminal & SNMP → *Enable SSH service*.
   Matikan lagi setelah selesai bila tidak dipakai.
4. Domain sudah dikelola di Cloudflare (lihat [cloudflare.md](cloudflare.md)).

## 4. Ya, perlu membuat folder — begini caranya

Struktur yang dibutuhkan:

```
/volume1/docker/yasun-studio/
├── docker-compose.yml    ← dari repo: deploy/synology/docker-compose.yml
├── .env                  ← dari repo: deploy/synology/.env.example (lalu diisi)
├── deploy.sh             ← update/deploy satu perintah
├── backup.sh             ← backup database (dijadwalkan)
├── restore.sh            ← pulihkan backup
├── data/
│   ├── postgres/         ← data PostgreSQL (dibuat otomatis oleh deploy.sh)
│   └── redis/            ← data Redis
└── backups/              ← hasil backup.sh
```

**Cara A — lewat SSH (disarankan, izin folder pasti benar):**

```bash
ssh <user-admin>@<IP-NAS>
sudo mkdir -p /volume1/docker/yasun-studio/{data/postgres,data/redis,backups}
cd /volume1/docker/yasun-studio
```

**Cara B — lewat File Station:** buka shared folder `docker` → *Create folder* `yasun-studio`.
Subfolder `data/` dan `backups/` akan dibuat otomatis oleh `deploy.sh`.

> Jangan membuat `data/postgres` lewat File Station dengan ACL khusus — PostgreSQL perlu menjadi
> pemilik folder tersebut. Jika sudah terlanjur dan container `db` gagal start dengan
> *permission denied*, jalankan: `sudo rm -rf data/postgres && sudo mkdir data/postgres`
> (hanya jika database masih kosong!).

### Salin file deploy ke NAS

Dari komputer (di folder repo):

```bash
scp deploy/synology/{docker-compose.yml,deploy.sh,backup.sh,restore.sh,.env.example} \
    <user-admin>@<IP-NAS>:/volume1/docker/yasun-studio/
```

Atau unggah kelima file itu lewat File Station. Lalu di NAS:

```bash
cd /volume1/docker/yasun-studio
sudo chmod +x deploy.sh backup.sh restore.sh
sudo cp .env.example .env
sudo vi .env        # isi semua nilai <...>
```

Untuk membuat secret acak: `openssl rand -hex 32` (jalankan di NAS atau komputer).

> ⚠️ **Hindari karakter `$` di file `.env`.** Docker Compose membacanya sebagai variabel dan diam-diam
> mengubah nilainya (sudah teruji). Gunakan secret heksadesimal dari `openssl rand -hex`, atau tulis `$$`.

## 5. Siapkan GitHub (sekali saja)

1. Push kode ke `main` di https://github.com/yasunstudio/yasun-studio-web.
2. **Settings → Secrets and variables → Actions → Variables → New repository variable**
   - `SITE_URL` = `https://<domain>` (wajib — dimasukkan ke build frontend)
   - `PLATFORMS` = `linux/amd64,linux/arm64` (hanya untuk NAS ARM)
3. Tab **Actions** → tunggu workflow **Release images** selesai (hijau). Image akan muncul di
   profil GitHub → *Packages*: `yasun-studio-backend`, `yasun-studio-frontend`, `yasun-studio-gateway`.
4. **Akses image dari NAS** — pilih salah satu:
   - *Paling mudah:* buka tiap package → *Package settings* → *Change visibility* → **Public**
     (kode sumber tetap privat jika repo privat; image tidak berisi secret).
   - *Tetap privat:* buat token di GitHub → *Settings → Developer settings → Personal access tokens
     (classic)* dengan scope **`read:packages`** saja, lalu di NAS:
     ```bash
     sudo docker login ghcr.io -u yasunstudio     # tempel token sebagai password
     ```

## 6. Deploy pertama

```bash
cd /volume1/docker/yasun-studio
sudo ./deploy.sh
```

Skrip ini: membackup database (jika sudah ada) → menarik image → menjalankan stack (migrasi database
otomatis) → menunggu hingga API **dan** situs benar-benar merespons → membersihkan image lama.

Cek dari jaringan lokal: `http://<IP-NAS>:8088` (port `LAN_PORT` di `.env`).

> Login admin **harus lewat domain HTTPS**, bukan `http://<IP-NAS>:8088`. Cookie sesi bertanda
> `Secure`, sehingga browser tidak menyimpannya lewat HTTP biasa. Port LAN hanya untuk pengecekan.

Alternatif GUI: Container Manager → **Project** → *Create* → Path: `/docker/yasun-studio` →
*Use existing docker-compose.yml*. (Tetap jalankan `deploy.sh` untuk update agar backup & health check ikut berjalan.)

Setelah login pertama: ubah password admin di menu **Akun**, lalu kosongkan
`FIRST_SUPERUSER_PASSWORD` di `.env` atau ganti dengan nilai lain.

## 7. Update & rollback

- **Update ke versi terbaru `main`:** `sudo ./deploy.sh`
- **Rollback ke versi tertentu:** cari tag `sha-xxxxxxx` di halaman package GitHub, lalu
  `sudo IMAGE_TAG=sha-xxxxxxx ./deploy.sh` (atau set `IMAGE_TAG` di `.env` agar menetap).
- Migrasi database berjalan otomatis saat backend start; backup otomatis dibuat sebelum setiap deploy.

## 8. Backup & pemulihan

1. **Backup database harian** — Control Panel → Task Scheduler → *Create → Scheduled Task →
   User-defined script*:
   - User: `root` · Jadwal: setiap hari 02:00
   - Script: `/volume1/docker/yasun-studio/backup.sh`
   - Menyimpan 14 hari terakhir di `backups/` (atur dengan `KEEP_DAYS=30 /volume1/.../backup.sh`).
2. **Salin ke luar NAS** — Hyper Backup → backup folder `docker/yasun-studio/backups`
   (dan `.env`) ke drive eksternal / Synology C2 / NAS lain. Aturan 3-2-1.
3. **Snapshot (opsional, Btrfs)** — Snapshot Replication untuk shared folder `docker`.
4. **Memulihkan:**
   ```bash
   sudo ./restore.sh backups/yasun_studio-YYYYMMDD-HHMMSS.dump
   ```
   Skrip meminta konfirmasi nama database sebelum menimpa data.

## 9. Checklist keamanan

- [ ] Router: **tidak ada** port-forward ke NAS (Cloudflare Tunnel sudah cukup).
- [ ] Control Panel → Security → Firewall: izinkan port `8088` hanya dari subnet LAN.
- [ ] DSM: aktifkan 2FA untuk akun admin, *Auto Block*, dan matikan akun `admin` bawaan.
- [ ] SSH dimatikan kembali setelah setup (atau dibatasi ke LAN).
- [ ] `.env` hanya bisa dibaca root: `sudo chmod 600 .env`.
- [ ] Password admin aplikasi diganti setelah login pertama.
- [ ] Backup terjadwal berjalan dan pernah dicoba di-restore.

## 10. Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| `docker: command not found` | Gunakan `sudo`, atau login sebagai user admin. Container Manager harus terinstal. |
| `denied` saat pull dari ghcr.io | Image masih privat → lakukan langkah 5.4. |
| `exec format error` | Arsitektur NAS ARM → set `PLATFORMS` dan jalankan ulang workflow. |
| Container `db` restart terus | Izin folder `data/postgres` (lihat langkah 4) atau RAM penuh. |
| Situs publik error 1033 / 502 | Tunnel tidak terhubung → `sudo docker compose logs cloudflared`; cek token di `.env`. |
| Login gagal tanpa pesan | Login melalui HTTP/IP LAN → gunakan domain HTTPS. |
| NAS lambat | Turunkan `WEB_CONCURRENCY` ke 1; cek *Resource Monitor*. |

Perintah berguna (di `/volume1/docker/yasun-studio`):

```bash
sudo docker compose ps                         # status semua service
sudo docker compose logs -f --tail=100 backend # log backend (ganti: frontend, gateway, cloudflared, db)
sudo docker compose restart backend            # restart satu service
sudo docker stats --no-stream                  # pemakaian CPU/RAM
```

## 11. Catatan untuk tim

- Konfigurasi deploy ada di repo: [`deploy/synology/`](../deploy/synology/). Perubahan di sana
  perlu disalin ulang ke NAS (image aplikasi diperbarui otomatis lewat `deploy.sh`).
- Seluruh stack ini sudah diuji coba lokal dengan image produksi: `deploy.sh` (termasuk backup
  sebelum deploy dan menunggu kesiapan), `restore.sh`, mode produksi (dokumentasi API mati, tanpa data
  demo), dan rate limit memakai IP asli pengunjung dari header Cloudflare.
