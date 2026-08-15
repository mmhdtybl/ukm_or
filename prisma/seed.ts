import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERIODE_ANGGOTA = "2025/2026";
const PERIODE_PENGURUS_MULAI = "2024/2025";
const DIVISI = ["Voli", "Futsal", "Bulutangkis", "E-Sport", "Taekwondo", "Basket"];

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const pengurusPassword = await bcrypt.hash("pengurus123", 10);
  const anggotaPassword = await bcrypt.hash("anggota123", 10);

  // ===== Akun contoh =====
  const admin = await prisma.user.upsert({
    where: { nim: "ADMIN001" },
    update: {},
    create: {
      name: "Administrator",
      nim: "ADMIN001",
      email: "admin@ukmolahraga.unimma.ac.id",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const ketuaUmumUser = await prisma.user.upsert({
    where: { nim: "21201001" },
    update: {},
    create: {
      name: "Muhammad Rizky",
      nim: "21201001",
      email: "ketua@ukmolahraga.unimma.ac.id",
      password: pengurusPassword,
      role: "PENGURUS",
    },
  });

  const bendaharaUser = await prisma.user.upsert({
    where: { nim: "21201004" },
    update: {},
    create: {
      name: "Putri Anggraini",
      nim: "21201004",
      email: "bendahara@ukmolahraga.unimma.ac.id",
      password: pengurusPassword,
      role: "PENGURUS",
    },
  });

  const kadivVoliUser = await prisma.user.upsert({
    where: { nim: "22201030" },
    update: {},
    create: {
      name: "Bayu Saputra",
      nim: "22201030",
      email: "kadivvoli@ukmolahraga.unimma.ac.id",
      password: pengurusPassword,
      role: "PENGURUS",
    },
  });

  const anggotaUser = await prisma.user.upsert({
    where: { nim: "22201050" },
    update: {},
    create: {
      name: "Siti Aminah",
      nim: "22201050",
      email: "anggota@ukmolahraga.unimma.ac.id",
      password: anggotaPassword,
      role: "ANGGOTA",
    },
  });

  await prisma.anggota.upsert({
    where: { userId: anggotaUser.id },
    update: {},
    create: {
      userId: anggotaUser.id,
      nim: "22201050",
      nama: "Siti Aminah",
      prodi: "Ilmu Keperawatan",
      angkatan: "2022",
      divisi: "Voli",
      periode: PERIODE_ANGGOTA,
    },
  });

  // ===== Profil UKM & Ketentuan Website =====
  await prisma.profilUKM.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      namaUKM: "UKM Olahraga Unimma",
      deskripsi:
        "UKM Olahraga Unimma adalah wadah pengembangan minat dan bakat mahasiswa di bidang olahraga dan event. Kami menaungi 6 cabang olahraga: Voli, Futsal, Bulutangkis, E-Sport, Taekwondo, dan Basket.",
      visi: "Menjadi wadah pengembangan prestasi olahraga mahasiswa yang unggul, sportif, dan berdaya saing di tingkat regional maupun nasional.",
      misi:
        "1. Membina dan mengembangkan potensi mahasiswa di berbagai cabang olahraga.\n2. Menyelenggarakan latihan rutin, kompetisi, dan event olahraga kampus.\n3. Membangun semangat sportivitas, kerja sama tim, dan kedisiplinan.\n4. Mengharumkan nama almamater melalui prestasi di bidang olahraga.",
      sejarah: "UKM Olahraga Unimma didirikan sebagai wadah bagi mahasiswa yang memiliki minat dan bakat di bidang olahraga untuk berkembang dan berprestasi.",
      alamat: "Gedung Kemahasiswaan, Universitas Muhammadiyah Magelang",
      email: "ukmolahraga@unimma.ac.id",
      telepon: "0812-3456-7890",
      waGroupLink: "https://chat.whatsapp.com/contoh-link-grup-ukm",
    },
  });

  // ===== Struktur Organisasi (dengan kodeJabatan untuk hak akses) =====
  const pengurusData: Array<{
    nama: string; jabatan: string; kodeJabatan: string; kelompok: string;
    divisi?: string; urutan: number; userId?: string;
  }> = [
    { nama: "Prof. Dr. Ahmad Fauzi", jabatan: "Ketua DPO", kodeJabatan: "DPO", kelompok: "DPO", urutan: 1 },
    { nama: "Muhammad Rizky", jabatan: "Ketua Umum", kodeJabatan: "KETUA_UMUM", kelompok: "Inti", urutan: 10, userId: ketuaUmumUser.id },
    { nama: "Dewi Lestari", jabatan: "Wakil Ketua Umum", kodeJabatan: "WAKIL_KETUA", kelompok: "Inti", urutan: 11 },
    { nama: "Ahmad Fauzan", jabatan: "Sekretaris", kodeJabatan: "SEKRETARIS", kelompok: "Inti", urutan: 12 },
    { nama: "Putri Anggraini", jabatan: "Bendahara", kodeJabatan: "BENDAHARA", kelompok: "Inti", urutan: 13, userId: bendaharaUser.id },
    { nama: "Rafi Hidayat", jabatan: "Bidang SDM", kodeJabatan: "BIDANG_SDM", kelompok: "Bidang", urutan: 20 },
    { nama: "Nabila Putri", jabatan: "Bidang Inventaris", kodeJabatan: "BIDANG_INVENTARIS", kelompok: "Bidang", urutan: 21 },
    { nama: "Fajar Nugroho", jabatan: "Bidang Media Informasi", kodeJabatan: "BIDANG_MEDIA", kelompok: "Bidang", urutan: 22 },
    { nama: "Bayu Saputra", jabatan: "Kadiv Voli", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Voli", urutan: 30, userId: kadivVoliUser.id },
    { nama: "Andika Pratama", jabatan: "Kadiv Futsal", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Futsal", urutan: 31 },
    { nama: "Citra Ayu", jabatan: "Kadiv Bulutangkis", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Bulutangkis", urutan: 32 },
    { nama: "Reza Firmansyah", jabatan: "Kadiv E-Sport", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "E-Sport", urutan: 33 },
    { nama: "Indah Permatasari", jabatan: "Kadiv Taekwondo", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Taekwondo", urutan: 34 },
    { nama: "Galih Prasetyo", jabatan: "Kadiv Basket", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Basket", urutan: 35 },
  ];

  for (const p of pengurusData) {
    const existing = await prisma.pengurus.findFirst({ where: { nama: p.nama, jabatan: p.jabatan } });
    if (!existing) {
      await prisma.pengurus.create({
        data: {
          nama: p.nama,
          jabatan: p.jabatan,
          kodeJabatan: p.kodeJabatan,
          kelompok: p.kelompok,
          divisi: p.divisi || null,
          periodeMulai: PERIODE_PENGURUS_MULAI,
          urutan: p.urutan,
          userId: p.userId || undefined,
        },
      });
    }
  }

  // ===== Kategori Berita =====
  await prisma.kategoriBerita.upsert({ where: { slug: "kegiatan" }, update: {}, create: { nama: "Kegiatan", slug: "kegiatan" } });
  await prisma.kategoriBerita.upsert({ where: { slug: "prestasi" }, update: {}, create: { nama: "Prestasi", slug: "prestasi" } });
  await prisma.kategoriBerita.upsert({ where: { slug: "pengumuman" }, update: {}, create: { nama: "Pengumuman", slug: "pengumuman" } });

  // ===== Contoh data barang inventaris =====
  const barangCount = await prisma.barang.count();
  if (barangCount === 0) {
    await prisma.barang.createMany({
      data: [
        { nama: "Bola Voli Mikasa", divisi: "Voli", jumlah: 6, kondisi: "Baik" },
        { nama: "Bola Futsal", divisi: "Futsal", jumlah: 4, kondisi: "Baik" },
        { nama: "Net Bulutangkis", divisi: "Bulutangkis", jumlah: 2, kondisi: "Rusak", keterangan: "Net sobek, perlu diganti" },
      ],
    });
  }

  console.log("Seed selesai:", {
    admin: admin.nim,
    ketuaUmum: ketuaUmumUser.nim,
    bendahara: bendaharaUser.nim,
    kadivVoli: kadivVoliUser.nim,
    anggota: anggotaUser.nim,
    divisi: DIVISI,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
