# Cloudflare untuk Yasun Studio

Domain dilayani Cloudflare dan diteruskan ke NAS lewat **Cloudflare Tunnel** — tanpa membuka port
di router dan tanpa mengurus sertifikat SSL di NAS. Pasangannya: [synology.md](synology.md).

## 1. Data akun (isi oleh admin)

| Item | Nilai |
|---|---|
| Domain | `__________` (mis. yasunstudio.com) |
| Akun Cloudflare (email pemilik) | `__________` |
| Nama tunnel | `yasun-studio-nas` |
| Hostname publik | `__________` (apex) dan `www.__________` |
| Email staf untuk Cloudflare Access (opsional) | `__________` |

## 2. Hubungkan domain ke Cloudflare (lewati jika sudah)

1. https://dash.cloudflare.com → **Add a domain** → masukkan domain → pilih paket **Free**.
2. Ganti **nameserver** di registrar domain (Niagahoster, Rumahweb, dll.) dengan dua nameserver
   yang diberikan Cloudflare. Tunggu status *Active* (biasanya < 1 jam, maksimal 24 jam).

## 3. Buat tunnel (±5 menit)

1. Dashboard → **Zero Trust** → **Networks → Tunnels** → **Create a tunnel**.
   (Pertama kali, Zero Trust meminta membuat *team name* dan memilih paket **Free**.)
2. Tipe connector: **Cloudflared** → nama: `yasun-studio-nas` → *Save tunnel*.
3. Di halaman *Install and run a connector*, pilih **Docker**. Akan muncul perintah seperti
   `docker run cloudflare/cloudflared:latest tunnel ... run --token eyJhIjoi...`.
   **Salin hanya nilai token** (mulai dari `eyJ...`) — jangan jalankan perintahnya.
4. Tempel ke `.env` di NAS:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi...
   ```
   Container `cloudflared` sudah ada di `docker-compose.yml`, jadi cukup jalankan `sudo ./deploy.sh`.
5. Kembali ke dashboard → status tunnel harus **HEALTHY**.

## 4. Public hostname (arahkan domain ke aplikasi)

Di tunnel `yasun-studio-nas` → tab **Public Hostname** → **Add a public hostname**:

| Subdomain | Domain | Path | Service type | URL |
|---|---|---|---|---|
| *(kosong)* | `<domain>` | *(kosong)* | `HTTP` | `gateway:80` |
| `www` | `<domain>` | *(kosong)* | `HTTP` | `gateway:80` |

`gateway` adalah nama service nginx di jaringan Docker — tunnel menjangkaunya secara internal.
Cloudflare otomatis membuat record DNS (CNAME ke `<id>.cfargotunnel.com`).

> Pastikan `SITE_URL`, `FRONTEND_URL`, dan `CORS_ORIGINS` di `.env` NAS, serta variabel repository
> GitHub `SITE_URL`, memakai domain yang sama (`https://<domain>`).

**Arahkan `www` ke domain utama** (agar URL konsisten untuk SEO):
Rules → **Redirect Rules** → *Create rule* → *Redirect from WWW to root* (template) → Deploy.

## 5. Pengaturan SSL/TLS & keamanan

| Menu | Pengaturan |
|---|---|
| SSL/TLS → Overview | **Full** (koneksi tunnel sudah terenkripsi) |
| SSL/TLS → Edge Certificates | **Always Use HTTPS**: On · **Minimum TLS**: 1.2 · **Automatic HTTPS Rewrites**: On |
| SSL/TLS → Edge Certificates → HSTS | Aktifkan **setelah** situs berjalan stabil via HTTPS (max-age 6 bulan) |
| Security → Settings | Security level: Medium · **Browser Integrity Check**: On |
| Security → WAF → Managed rules | Pastikan *Cloudflare Free Managed Ruleset* aktif (default di paket Free) |
| Security → WAF → Rate limiting rules | Lihat langkah 6 |

> Hindari *Bot Fight Mode* untuk sementara — dapat memblokir pemanggilan API dari browser pengguna.

## 6. Rate limit di edge (lapisan tambahan)

Aplikasi sudah membatasi login/pendaftaran per IP. Tambahkan juga di Cloudflare agar serangan
berhenti sebelum sampai ke NAS:

Security → WAF → **Rate limiting rules** → *Create rule*:
- Nama: `auth-protection`
- Kondisi: *URI Path* `starts with` `/login` **OR** `starts with` `/daftar` **OR** `starts with` `/api/v1/auth/`
- Paket **Free**: 1 aturan, periode **10 detik**, blokir **10 detik** → contoh: **10 request / 10 detik**
  per IP → Action: **Block**
- Paket Pro ke atas bisa memakai periode lebih panjang (mis. 20 request/menit, blokir 10 menit).

## 7. Lindungi dashboard admin (opsional, disarankan)

Lapisan login kedua khusus staf sebelum halaman `/admin` terbuka:

Zero Trust → **Access → Applications** → *Add an application* → **Self-hosted**:
- Application domain: `<domain>` · Path: `admin`
- Policy: *Allow* → *Emails* → daftar email staf (atau *Emails ending in* `@<domain>`)
- Metode login: **One-time PIN** (kode dikirim ke email)

Pelajar tidak terpengaruh — hanya path `/admin` yang dilindungi.

## 8. Cache

Default Cloudflare sudah tepat: file statis (`/_next/static/*`, gambar, font) di-cache di edge;
HTML dan `/api/*` tidak di-cache. **Jangan** membuat aturan *Cache Everything* — halaman yang sudah
login bisa ikut ter-cache dan tampil ke pengguna lain.

Setelah deploy versi baru tidak perlu *purge cache* — nama file aset Next.js berubah otomatis.

## 9. Verifikasi

```bash
curl -I https://<domain>            # HTTP/2 200, header "server: cloudflare"
curl https://<domain>/health        # {"status":"ok",...}
```

Lalu dari browser: buka situs, daftar akun pelajar, dan login admin lewat `https://<domain>/login`.

IP asli pengunjung diteruskan dari header `CF-Connecting-IP` (sudah dikonfigurasi di image gateway),
sehingga rate limit aplikasi berlaku per pengunjung, bukan per tunnel.

## 10. Bisakah setup ini dilakukan otomatis oleh Claude?

Claude tidak memiliki akses ke akun Cloudflare Anda, sehingga langkah dashboard di atas (± 15 menit)
paling aman dilakukan sendiri. Jika ingin diotomatiskan via API, siapkan **API Token** khusus
(My Profile → API Tokens → *Create Custom Token*) dengan izin minimum:

- Account → **Cloudflare Tunnel: Edit**
- Zone (`<domain>`) → **DNS: Edit**, **Zone Settings: Edit**, **Zone WAF: Edit**

Berikan juga *Account ID* dan *Zone ID*. Batasi masa berlaku token (mis. 1 hari) dan **cabut token**
setelah setup selesai. Jangan menyimpan token ini di repo atau `.env`.
