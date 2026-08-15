# Website UKM Olahraga Unimma

Website resmi UKM Olahraga Universitas Muhammadiyah Magelang, berbasis **Next.js 14 (App Router)**, **Prisma**, **NextAuth**, dan **TailwindCSS** (gaya visual kaca/blur ala iOS).

Menaungi 6 cabang olahraga: **Voli, Futsal, Bulutangkis, E-Sport, Taekwondo, Basket**.

## ✨ Fitur

**Halaman Publik**
Home · Profil UKM · Visi & Misi · Struktur Organisasi (dikelompokkan: DPO → Inti → Bidang → Kadiv) ·
Galeri · Berita (+pencarian & kategori) · Agenda Kegiatan · Prestasi · Kontak (form) ·
Pendaftaran Anggota (hanya mendaftar, **bukan** membuat akun login) · Unduhan File (AD/ART, proposal, dll.)

**Login**: memakai **NPM/NIM + password** (bukan email). Email hanya dipakai untuk notifikasi.

## 🔐 Struktur Keanggotaan & Hak Akses

Website ini punya sistem hak akses **granular per-jabatan**, bukan sekadar 3 role datar. Logikanya ada di `src/lib/permissions.ts` (fungsi `getKapabilitas()`).

| Jabatan | Hak Akses |
|---|---|
| **Admin** | CRUD semua data + ubah seluruh ketentuan website |
| **Ketua Umum / Wakil Ketua** | CRUD semua data (setara Admin, kecuali bukan akun sistem) |
| **DPO** (Dewan Pertimbangan Organisasi) | **Hanya melihat** (Monitoring) — tidak bisa mengubah apa pun |
| **Sekretaris** | Upload & hapus Arsip (dokumen resmi) |
| **Bendahara** | Kelola Kas & Keuangan (catat transaksi + verifikasi laporan kas anggota) |
| **Bidang SDM** | Kelola Agenda kegiatan + Kelola Anggota (semua divisi) |
| **Bidang Inventaris** | Kelola Barang (kondisi Baik/Rusak) + tindak lanjuti laporan dari anggota |
| **Bidang Media Informasi** | Kelola Galeri, Berita, Banner, dan foto Struktur Organisasi |
| **Kadiv** (per cabang olahraga) | CRUD staff **hanya pada divisinya sendiri** |
| **Anggota / Staff** | Hanya melihat + Presensi (unggah foto kegiatan) + ajukan pembayaran Kas + lapor/request Barang ke Inventaris |

**Anggota** berlaku untuk masa keanggotaan **1 periode**. **Pengurus** dapat menjabat **2–3 periode** (field `periodeMulai`/`periodeAkhir` di data Pengurus).

## 🗄️ Struktur Database (Prisma)
`User, Anggota, Pengurus, Berita, KategoriBerita, Galeri, Agenda, PresensiFoto, Prestasi, Pendaftaran, Kontak, FileUnduhan, Banner, ProfilUKM, Arsip, Keuangan, Barang, KomentarBarang`

Lihat detail lengkap di `prisma/schema.prisma`.

---

## 🚀 Cara Menjalankan (Development)

### 1. Prasyarat
- Node.js 18+ dan npm
- (Opsional) akun Gmail/SMTP untuk fitur notifikasi email

### 2. Install dependency
```bash
npm install --legacy-peer-deps
```

### 3. Konfigurasi environment
```bash
cp .env.example .env
```
Sesuaikan `DATABASE_URL` dengan koneksi Supabase PostgreSQL, lalu isi `NEXTAUTH_SECRET`, dan `SMTP_*` di file `.env`.

Contoh koneksi Supabase:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
# atau gunakan pooler jika perlu untuk serverless:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 4. Setup database
```bash
npx prisma db push
npm run db:seed
```

Akun contoh hasil seed:

| Peran | NPM/NIM (login) | Password |
|---|---|---|
| Admin | `ADMIN001` | `admin123` |
| Ketua Umum | `21201001` | `pengurus123` |
| Bendahara | `21201004` | `pengurus123` |
| Kadiv Voli | `22201030` | `pengurus123` |
| Anggota | `22201050` | `anggota123` |

**Segera ganti password default ini setelah instalasi.**

> ⚠️ Jika Anda pernah menjalankan versi sebelumnya, **hapus `dev.db` lama** sebelum `prisma db push` karena skema database berubah total (login NIM, struktur organisasi baru, sistem presensi baru, dsb):
> ```powershell
> Remove-Item dev.db -ErrorAction SilentlyContinue
> ```

### 5. Jalankan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000). Login di `/login`, lalu otomatis diarahkan ke `/dashboard` (Admin/Pengurus) atau `/akun-saya` (Anggota) — **tanpa navbar publik**, digantikan sidebar sesuai hak akses.

### 6. Build production
```bash
npm run build
npm run start
```

---

## 📋 Alur Pendaftaran Anggota Baru

1. Pengunjung mengisi form di halaman publik **`/pendaftaran`** — **ini hanya mendaftar, tidak membuat akun login apa pun.**
2. Admin/Ketua/Wakil/Bidang SDM meninjau di **Dashboard → Pendaftaran Masuk**, lalu **Terima** atau **Tolak**.
3. Jika **Diterima**: sistem otomatis mengirim email berisi **link grup WhatsApp** (diatur di **Dashboard → Ketentuan Website → Grup WhatsApp**). Pendaftar diminta bergabung ke grup terlebih dahulu.
4. Setelah bergabung, Admin/Ketua/Wakil/Bidang SDM (atau Kadiv untuk staff divisinya sendiri) membuatkan **akun login manual** melalui **Dashboard → Kelola Anggota** → tombol kunci di kolom "Akun" → masukkan email → sistem generate NIM+password acak dan mengirimkannya via email.

## 📸 Presensi Kegiatan (Manual, Bukan Biometrik)

Presensi dilakukan **manual**: siapa pun yang berwenang (Pengurus non-DPO, atau Anggota/staff) mengunggah **foto kegiatan/event yang sedang berlangsung** sebagai bukti dokumentasi — bukan absensi per-individu dengan scan wajah/QR.

- Pengurus: **Dashboard → Kelola Agenda → Foto Presensi** pada kegiatan terkait.
- Anggota: **Akun Saya → Presensi Kegiatan** → pilih kegiatan → unggah foto.

## 🛠️ Menambah Fitur / Modifikasi
- **Ganti ke Supabase/PostgreSQL**: pastikan `provider` di `prisma/schema.prisma` adalah `postgresql`, sesuaikan `DATABASE_URL` ke koneksi Supabase, lalu `npx prisma db push`.
- **Upload ke cloud storage**: ganti implementasi di `src/app/api/upload/route.ts` (saat ini disimpan lokal di `public/uploads`, tidak cocok untuk hosting serverless/ephemeral seperti Vercel).
- **Tambah jabatan/hak akses baru**: edit `src/lib/permissions.ts` (tambah `KodeJabatan` baru + flag kapabilitasnya), lalu sesuaikan opsi di `src/components/admin/PengurusManager.tsx`.

## ⚠️ Catatan
- Proyek ini scaffold fungsional lengkap untuk kebutuhan UKM Olahraga; sesuaikan lagi validasi, keamanan, dan desain sebelum dipakai resmi.
- Deteksi warna pakaian/objek otomatis **tidak** digunakan (dihapus bersama fitur face-scan) — presensi kini murni dokumentasi foto manual sesuai permintaan.
