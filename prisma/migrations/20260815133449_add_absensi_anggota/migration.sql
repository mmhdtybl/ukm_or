-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ANGGOTA',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" TEXT NOT NULL,
    "noHp" TEXT,
    "foto" TEXT,
    "divisi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "periode" TEXT,
    "tanggalGabung" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Anggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pengurus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "kodeJabatan" TEXT NOT NULL DEFAULT 'KADIV',
    "kelompok" TEXT NOT NULL DEFAULT 'Lainnya',
    "divisi" TEXT,
    "foto" TEXT,
    "periodeMulai" TEXT NOT NULL,
    "periodeAkhir" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pengurus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KategoriBerita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Berita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "gambar" TEXT,
    "kategoriId" TEXT,
    "penulisId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "dilihat" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Berita_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriBerita" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Berita_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Galeri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "gambar" TEXT NOT NULL,
    "kategori" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggalMulai" DATETIME NOT NULL,
    "tanggalSelesai" DATETIME NOT NULL,
    "gambar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKAN_DATANG',
    "kuota" INTEGER,
    "penyelenggara" TEXT,
    "dibuatOlehId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agenda_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AbsensiAnggota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agendaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'HADIR',
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AbsensiAnggota_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AbsensiAnggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PresensiFoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agendaId" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "keterangan" TEXT,
    "diunggahOlehId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PresensiFoto_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PresensiFoto_diunggahOlehId_fkey" FOREIGN KEY ("diunggahOlehId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prestasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "peraih" TEXT NOT NULL,
    "penyelenggara" TEXT,
    "tahun" INTEGER NOT NULL,
    "gambar" TEXT,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" TEXT NOT NULL,
    "motivasi" TEXT NOT NULL,
    "divisiPilihan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kontak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subjek" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FileUnduhan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "kategori" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "subjudul" TEXT,
    "gambar" TEXT NOT NULL,
    "linkUrl" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ProfilUKM" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namaUKM" TEXT NOT NULL,
    "logo" TEXT,
    "deskripsi" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "sejarah" TEXT,
    "alamat" TEXT,
    "email" TEXT,
    "telepon" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "waGroupLink" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Arsip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "kategori" TEXT,
    "fileUrl" TEXT NOT NULL,
    "diunggahOlehId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Arsip_diunggahOlehId_fkey" FOREIGN KEY ("diunggahOlehId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Keuangan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenis" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "jumlah" REAL NOT NULL,
    "keterangan" TEXT,
    "buktiUrl" TEXT,
    "anggotaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DIVERIFIKASI',
    "dicatatOlehId" TEXT,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Keuangan_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Keuangan_dicatatOlehId_fkey" FOREIGN KEY ("dicatatOlehId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "divisi" TEXT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "kondisi" TEXT NOT NULL DEFAULT 'Baik',
    "gambar" TEXT,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KomentarBarang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barangId" TEXT,
    "anggotaId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KomentarBarang_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KomentarBarang_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nim_key" ON "User"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_userId_key" ON "Anggota"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_nim_key" ON "Anggota"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Pengurus_userId_key" ON "Pengurus"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriBerita_nama_key" ON "KategoriBerita"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriBerita_slug_key" ON "KategoriBerita"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Berita_slug_key" ON "Berita"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Agenda_slug_key" ON "Agenda"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AbsensiAnggota_agendaId_userId_key" ON "AbsensiAnggota"("agendaId", "userId");
