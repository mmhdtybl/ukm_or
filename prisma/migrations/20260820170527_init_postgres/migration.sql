-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ANGGOTA',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" TEXT NOT NULL,
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
    "tanggalGabung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengurus" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "nama" TEXT NOT NULL,
    "nim" TEXT,
    "prodi" TEXT,
    "alamat" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jabatan" TEXT NOT NULL,
    "kodeJabatan" TEXT NOT NULL DEFAULT 'KADIV',
    "kelompok" TEXT NOT NULL DEFAULT 'Lainnya',
    "divisi" TEXT,
    "foto" TEXT,
    "periodeMulai" TEXT NOT NULL,
    "periodeAkhir" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengurus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriBerita" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "KategoriBerita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "gambar" TEXT,
    "kategoriId" TEXT,
    "penulisId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "dilihat" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Galeri" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "gambar" TEXT NOT NULL,
    "kategori" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Galeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "gambar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKAN_DATANG',
    "kuota" INTEGER,
    "penyelenggara" TEXT,
    "dibuatOlehId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsensiAnggota" (
    "id" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'HADIR',
    "alasanIzin" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbsensiAnggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresensiFoto" (
    "id" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "keterangan" TEXT,
    "diunggahOlehId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresensiFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "peraih" TEXT NOT NULL,
    "penyelenggara" TEXT,
    "tahun" INTEGER NOT NULL,
    "gambar" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "email" TEXT,
    "noHp" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "motivasi" TEXT NOT NULL,
    "divisiPilihan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tahap" TEXT NOT NULL DEFAULT 'PRADIKSAR',
    "tanggalDiksar" TIMESTAMP(3),
    "tanggalLulus" TIMESTAMP(3),
    "tanggalPradiksar1" TIMESTAMP(3),
    "tanggalPradiksar2" TIMESTAMP(3),

    CONSTRAINT "Pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kontak" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subjek" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kontak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileUnduhan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUnduhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "subjudul" TEXT,
    "gambar" TEXT NOT NULL,
    "linkUrl" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilUKM" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilUKM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arsip" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT,
    "fileUrl" TEXT NOT NULL,
    "diunggahOlehId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arsip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keuangan" (
    "id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "keterangan" TEXT,
    "buktiUrl" TEXT,
    "anggotaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DIVERIFIKASI',
    "dicatatOlehId" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keuangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "divisi" TEXT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "kondisi" TEXT NOT NULL DEFAULT 'Baik',
    "gambar" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KomentarBarang" (
    "id" TEXT NOT NULL,
    "barangId" TEXT,
    "anggotaId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KomentarBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkWhatsApp" (
    "id" TEXT NOT NULL,
    "tahap" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkWhatsApp_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "Berita_kategoriId_idx" ON "Berita"("kategoriId");

-- CreateIndex
CREATE INDEX "Berita_penulisId_idx" ON "Berita"("penulisId");

-- CreateIndex
CREATE UNIQUE INDEX "Agenda_slug_key" ON "Agenda"("slug");

-- CreateIndex
CREATE INDEX "Agenda_dibuatOlehId_idx" ON "Agenda"("dibuatOlehId");

-- CreateIndex
CREATE INDEX "AbsensiAnggota_agendaId_idx" ON "AbsensiAnggota"("agendaId");

-- CreateIndex
CREATE INDEX "AbsensiAnggota_userId_idx" ON "AbsensiAnggota"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AbsensiAnggota_agendaId_userId_key" ON "AbsensiAnggota"("agendaId", "userId");

-- CreateIndex
CREATE INDEX "PresensiFoto_agendaId_idx" ON "PresensiFoto"("agendaId");

-- CreateIndex
CREATE INDEX "PresensiFoto_diunggahOlehId_idx" ON "PresensiFoto"("diunggahOlehId");

-- CreateIndex
CREATE INDEX "Pendaftaran_nim_idx" ON "Pendaftaran"("nim");

-- CreateIndex
CREATE INDEX "Pendaftaran_status_idx" ON "Pendaftaran"("status");

-- CreateIndex
CREATE INDEX "Pendaftaran_tahap_idx" ON "Pendaftaran"("tahap");

-- CreateIndex
CREATE INDEX "Arsip_diunggahOlehId_idx" ON "Arsip"("diunggahOlehId");

-- CreateIndex
CREATE INDEX "Keuangan_anggotaId_idx" ON "Keuangan"("anggotaId");

-- CreateIndex
CREATE INDEX "Keuangan_dicatatOlehId_idx" ON "Keuangan"("dicatatOlehId");

-- CreateIndex
CREATE INDEX "KomentarBarang_anggotaId_idx" ON "KomentarBarang"("anggotaId");

-- CreateIndex
CREATE INDEX "KomentarBarang_barangId_idx" ON "KomentarBarang"("barangId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkWhatsApp_tahap_key" ON "LinkWhatsApp"("tahap");

-- AddForeignKey
ALTER TABLE "Anggota" ADD CONSTRAINT "Anggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengurus" ADD CONSTRAINT "Pengurus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriBerita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiAnggota" ADD CONSTRAINT "AbsensiAnggota_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiAnggota" ADD CONSTRAINT "AbsensiAnggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiFoto" ADD CONSTRAINT "PresensiFoto_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiFoto" ADD CONSTRAINT "PresensiFoto_diunggahOlehId_fkey" FOREIGN KEY ("diunggahOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arsip" ADD CONSTRAINT "Arsip_diunggahOlehId_fkey" FOREIGN KEY ("diunggahOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keuangan" ADD CONSTRAINT "Keuangan_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keuangan" ADD CONSTRAINT "Keuangan_dicatatOlehId_fkey" FOREIGN KEY ("dicatatOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KomentarBarang" ADD CONSTRAINT "KomentarBarang_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KomentarBarang" ADD CONSTRAINT "KomentarBarang_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
