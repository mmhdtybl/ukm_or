import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERIODE_ANGGOTA = "2025/2026";
const PERIODE_PENGURUS_MULAI = "2026/2027";
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
      alamat: "Sekretariat UKM Olahraga Unimma,Kampus 2 Universitas Muhammadiyah Magelang, Jl. Mayjend Bambang Soegeng No. 1, Magelang, Jawa Tengah, Indonesia",
      email: "ukmolahraga01@gmail.com",
      telepon: "0812-3456-7890",
      waGroupLink: "https://chat.whatsapp.com/contoh-link-grup-ukm",
    },
  });

  // ===== Struktur Organisasi periode 2026/2027 =====
  const pengurusData: Array<{
    nama: string; jabatan: string; kodeJabatan: string; kelompok: string;
    nim: string; prodi: string; alamat: string; tanggalLahir: string;
    divisi?: string; urutan: number; userId?: string;
  }> = [
    // BPH
    { nama: "Yaasir Indra Bhadra", jabatan: "Ketua Umum", kodeJabatan: "KETUA_UMUM", kelompok: "Inti", nim: "24.0101.0069", prodi: "Manajemen S1", alamat: "Sanggrahan,RT01/RW07, Mojotengah, Kedu, Temanggung", tanggalLahir: "2006-06-05", urutan: 1 },
    { nama: "Anru Hazba Amrullah", jabatan: "Wakil Ketua Umum", kodeJabatan: "WAKIL_KETUA", kelompok: "Inti", nim: "24.0504.0059", prodi: "Teknik Informatika S1", alamat: "Jono, RT005/RW009, Maduretno, Kaliangkrik, Magelang", tanggalLahir: "2005-09-06", urutan: 2 },
    { nama: "Tahta Indra Alfina", jabatan: "Sekretaris", kodeJabatan: "SEKRETARIS", kelompok: "Inti", nim: "25.0201.0004", prodi: "Ilmu Hukum S1", alamat: "Ganjuran II Rt 06/Rw 06, Tuksongo, Borobudur", tanggalLahir: "2007-07-13", urutan: 3 },
    { nama: "Alifa Nafi Pradita", jabatan: "Sekretaris", kodeJabatan: "SEKRETARIS", kelompok: "Inti", nim: "25.0801.0031", prodi: "Psikologi S1", alamat: "Magersari Rt 06/Rw 09, Kec. Magelang Selatan", tanggalLahir: "2006-12-25", urutan: 4 },
    { nama: "Dhea Aprilia Nur Aini", jabatan: "Bendahara", kodeJabatan: "BENDAHARA", kelompok: "Inti", nim: "25.0404.0022", prodi: "HES S1", alamat: "Kedok Rt 03/Rw 09, Ngadiharjo, Borobudur, Magelang", tanggalLahir: "2007-04-06", urutan: 5 },
    { nama: "Ananda Zahra Putri J", jabatan: "Bendahara", kodeJabatan: "BENDAHARA", kelompok: "Inti", nim: "25.0301.0022", prodi: "BK S1", alamat: "Jln. Kyai Mojo No 19", tanggalLahir: "2006-11-21", urutan: 6 },
    // Bidang SDM
    { nama: "Muhammad Lutfan A", jabatan: "Kabid SDM", kodeJabatan: "BIDANG_SDM", kelompok: "Bidang", nim: "25.0504.0022", prodi: "Teknik Informatika S1", alamat: "Sangubanyu Selatan Rt 02/Rw 13, Banyuwangi, Bandongan", tanggalLahir: "2006-04-07", urutan: 10 },
    { nama: "Aulia Rahmania", jabatan: "Staff SDM", kodeJabatan: "BIDANG_SDM_STAFF", kelompok: "Bidang", nim: "25.0101.0001", prodi: "Manajemen S1", alamat: "Bolong Wetan Rt 07/Rw 02, Tegalsari, Candimulyo", tanggalLahir: "2005-03-04", urutan: 11 },
    { nama: "Azmi Asrul Pratama", jabatan: "Staff SDM", kodeJabatan: "BIDANG_SDM_STAFF", kelompok: "Bidang", nim: "24.0505.0017", prodi: "Teknik Mesin S1", alamat: "Duren RT 3 / RW 7, Dukun, Magelang", tanggalLahir: "2006-06-23", urutan: 12 },
    { nama: "Salsabila Ayu Nur A", jabatan: "Staff SDM", kodeJabatan: "BIDANG_SDM_STAFF", kelompok: "Bidang", nim: "24.0305.0141", prodi: "PGSD S1", alamat: "Gedono, Rt 01 Rw 05, Donomulyo, Secang, Magelang", tanggalLahir: "2006-02-20", urutan: 13 },
    { nama: "Diva Amanda Eksa F", jabatan: "Staff SDM", kodeJabatan: "BIDANG_SDM_STAFF", kelompok: "Bidang", nim: "24.0305.0017", prodi: "PGSD S1", alamat: "Medono, Rt 01 Rw 07, Pringsurat, Temanggung", tanggalLahir: "2006-09-24", urutan: 14 },
    { nama: "Divarya Fathimatuzzahra", jabatan: "Staff SDM", kodeJabatan: "BIDANG_SDM_STAFF", kelompok: "Bidang", nim: "24.0101.0087", prodi: "Manajemen S1", alamat: "JL. Dahlia Rt 09/Rw 03, Mertoyudan, Magelang", tanggalLahir: "2005-12-06", urutan: 15 },
    // Bidang Inventaris dan Medifor
    { nama: "Raditya Nur afandi", jabatan: "Kabid Inventaris", kodeJabatan: "BIDANG_INVENTARIS", kelompok: "Bidang", nim: "25.0802.0036", prodi: "Ilmu Komunikasi S1", alamat: "Klumpukan, Seloboro, Salam, Magelang", tanggalLahir: "2006-06-11", urutan: 20 },
    { nama: "Dicky Arsellino", jabatan: "Staff Inventaris", kodeJabatan: "BIDANG_INVENTARIS_STAFF", kelompok: "Bidang", nim: "25.0102.0032", prodi: "Akuntansi S1", alamat: "Pakelan, Rt 01/Rw 07, Bulurejo, Mertoyudan", tanggalLahir: "2004-11-27", urutan: 21 },
    { nama: "Ginsania Diva S", jabatan: "Staff Inventaris", kodeJabatan: "BIDANG_INVENTARIS_STAFF", kelompok: "Bidang", nim: "24.0802.0054", prodi: "Ilmu Komunikasi", alamat: "Sangen, Rt 03 Rw 08, Candirejo, Borobudur, Magelang", tanggalLahir: "2005-12-23", urutan: 22 },
    { nama: "Laela Alasymi", jabatan: "Kabid Medifor", kodeJabatan: "BIDANG_MEDIA", kelompok: "Bidang", nim: "25.0501.0034", prodi: "Teknik Industri S1", alamat: "Karet Bulurejo Rt 01/Rw 04, Mertoyudan, Magelang", tanggalLahir: "2006-03-14", urutan: 30 },
    { nama: "Febrian Aulia Hafizh", jabatan: "Staff Medifor", kodeJabatan: "BIDANG_MEDIA_STAFF", kelompok: "Bidang", nim: "25.0504.0019", prodi: "Teknik Informatika S1", alamat: "Kauman Rt 06/ Rw 02, Grabag, Kab. Magelang", tanggalLahir: "2007-02-10", urutan: 31 },
    { nama: "Dennis Viananta Ramadani", jabatan: "Staff Medifor", kodeJabatan: "BIDANG_MEDIA_STAFF", kelompok: "Bidang", nim: "24.0505.0008", prodi: "Teknik Informatika S1", alamat: "Dusun Kaliangkrik, Krajan, Desa Kaliangkrik, Magelang", tanggalLahir: "2006-09-28", urutan: 32 },
    { nama: "Muhammad Toyibul Makmun", jabatan: "Staff Medifor", kodeJabatan: "BIDANG_MEDIA_STAFF", kelompok: "Bidang", nim: "23.0504.0010", prodi: "Teknik Informatika S1", alamat: "Dsn. Nglegok, Des. Sriwedari, Kec. Salaman, Kab. Magelang", tanggalLahir: "2004-05-29", urutan: 33 },
    // Divisi Futsal
    { nama: "Alfandy Danu Apriyanto", jabatan: "Kadiv Futsal", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Futsal", nim: "25.0305.0093", prodi: "PGSD S1", alamat: "Medayu Rt 19/Rw 05, Sidogede, Grabag, Magelang", tanggalLahir: "2005-04-05", urutan: 40 },
    { nama: "Hafidh Surya Sakti Nugraha", jabatan: "Staff Futsal", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Futsal", nim: "24.0305.0008", prodi: "PGSD S1", alamat: "Seneng, Mbanyurojo, Mertoyudan, Magelang", tanggalLahir: "2004-09-30", urutan: 41 },
    { nama: "Ryan Rahmantya", jabatan: "Staff Futsal", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Futsal", nim: "25.0801.0010", prodi: "Psikologi S1", alamat: "Johon Rt 03/Rw 09, Sukosasi, Bandongan, Magelang", tanggalLahir: "2007-01-27", urutan: 42 },
    { nama: "Aulia Narita Devi", jabatan: "Staff Futsal", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Futsal", nim: "25.0801.0023", prodi: "Psikologi S1", alamat: "Pletukan, Sidoagung, Tempuran", tanggalLahir: "2006-12-09", urutan: 43 },
    { nama: "Imtinan Khasna", jabatan: "Staff Futsal", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Futsal", nim: "25.0601.0003", prodi: "Keperawatan D3", alamat: "Maitan, Borobudur, Magelang", tanggalLahir: "2007-04-17", urutan: 44 },
    { nama: "Fairuz Rafi Izdihar", jabatan: "Staff Futsal", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Futsal", nim: "24.0305.0160", prodi: "PGSD S1", alamat: "Kalangan, Grabag, Magelang", tanggalLahir: "2006-06-11", urutan: 45 },
    { nama: "Muhammad Ihsan S", jabatan: "Staff Futsal", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Futsal", nim: "25.0305.0119", prodi: "PGSD S1", alamat: "Ponggol Rt 02/Rw 02, Grabag, Magelang", tanggalLahir: "2006-08-27", urutan: 46 },
    // Divisi Voli
    { nama: "Risma Salsabilla Aulia", jabatan: "Kadiv Voli", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Voli", nim: "25.0404.0020", prodi: "HES S1", alamat: "Banyuurip 2 Rt 02/Rw 03, Banyuurip, Tegalrejo, Magelang", tanggalLahir: "2007-04-05", urutan: 50 },
    { nama: "Sherly Retno Wulansari", jabatan: "Staff Voli", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Voli", nim: "25.0605.0008", prodi: "Farmasi D3", alamat: "Taji Rt 01/Rw 01, Taji, Prambanan, Klaten", tanggalLahir: "2007-07-18", urutan: 51 },
    { nama: "Eka Nur Widyawati", jabatan: "Staff Voli", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Voli", nim: "25.0603.0013", prodi: "Ilmu Keperawatan S1", alamat: "Katonan Rt 02/Rw 01, Keditan, Ngablak, Magelang", tanggalLahir: "2006-06-19", urutan: 52 },
    { nama: "Zulfa Jannatul Habibah", jabatan: "Staff Voli", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Voli", nim: "25.0603.0003", prodi: "Ilmu Keperawatan S1", alamat: "Binangun Rt 11/Rw 05, Wringinanom, Kretek, Wonosobo", tanggalLahir: "2006-06-27", urutan: 53 },
    { nama: "Nuha Khusnia Ramadhani", jabatan: "Staff Voli", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Voli", nim: "25.0603.0008", prodi: "Ilmu Keperawatan S1", alamat: "Santren Rt 02/Rw 08, Gunungpring, Muntilan, Magelang", tanggalLahir: "2006-09-25", urutan: 54 },
    { nama: "Lia Ernanda", jabatan: "Staff Voli", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Voli", nim: "25.0404.0016", prodi: "HES S1", alamat: "Tampingan Rt 04/Rw 05, Tampingan, Tegalrejo, Magelang", tanggalLahir: "2006-08-22", urutan: 55 },
    { nama: "Achmad Ardianto", jabatan: "Staff Voli", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Voli", nim: "24.0505.0014", prodi: "Teknik Mesin S1", alamat: "Pagiren Jambewangi RT28/RW13, Secang, Magelang", tanggalLahir: "2005-12-19", urutan: 56 },
    // Divisi Bulutangkis
    { nama: "Taofik Setyojati", jabatan: "Kadiv Bulutangkis", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Bulutangkis", nim: "25.0802.0045", prodi: "Ilmu Komunikasi S1", alamat: "Mejing Rt 16/Rw 06, Candimulyo, Magelang", tanggalLahir: "2005-07-14", urutan: 60 },
    { nama: "Eva Selfi Tri Utami", jabatan: "Staff Bulutangkis", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Bulutangkis", nim: "24.0201.0011", prodi: "Ilmu Hukum S1", alamat: "Tempuran Rt 05/Rw 05, Klepu, Kranggan, Temanggung", tanggalLahir: "2006-01-13", urutan: 61 },
    { nama: "Lulu Atun Nasikha", jabatan: "Staff Bulutangkis", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Bulutangkis", nim: "25.0801.0040", prodi: "Psikologi S1", alamat: "Dieng Kulon Rt 04/Rw 01, Batur, Banjarnegara", tanggalLahir: "2005-07-16", urutan: 62 },
    { nama: "Revina Putri Andriani", jabatan: "Staff Bulutangkis", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Bulutangkis", nim: "25.0601.0025", prodi: "Keperawatan D3", alamat: "Mangunan Rt 04/Rw 02, Mertoyudan, Magelang", tanggalLahir: "2007-07-06", urutan: 63 },
    { nama: "Wulan Maulidia", jabatan: "Staff Bulutangkis", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Bulutangkis", nim: "25.0602.0028", prodi: "Farmasi D3", alamat: "Kuadaan Rt 01/Rw 01, Girimulyo, Windusari, Magelang", tanggalLahir: "2006-04-04", urutan: 64 },
    // Divisi Taekwondo
    { nama: "Faiq Zaidan Dhia Ulhaq", jabatan: "Kadiv Taekwondo", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Taekwondo", nim: "24.0404.0002", prodi: "HES S1", alamat: "Banaran, Rt 02/Rw 15, Sedayu, Muntilan, Magelang", tanggalLahir: "2005-10-20", urutan: 70 },
    { nama: "Syahrun Nadzif Al Faqih", jabatan: "Staff Taekwondo", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Taekwondo", nim: "25.0802.0042", prodi: "Ilmu Komunikasi S1", alamat: "Tengon Rt 03/Rw 03, Jragan, Tembarak, Temanggung", tanggalLahir: "2006-09-27", urutan: 71 },
    { nama: "Ilyas Nabil Haidar", jabatan: "Staff Taekwondo", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Taekwondo", nim: "25.0802.0025", prodi: "Ilmu Komunikasi S1", alamat: "Lungge Rt 01/Rw 01, Temanggung, Kab. Temanggung", tanggalLahir: "2007-08-01", urutan: 72 },
    { nama: "Muhammad Wahyu Listhanfara", jabatan: "Staff Taekwondo", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Taekwondo", nim: "25.0505.0040", prodi: "Teknik Mesin S1", alamat: "Trasan Rt 01/Rw 11, Bandongan, Magelang", tanggalLahir: "2006-11-12", urutan: 73 },
    // Divisi Basket
    { nama: "Zacky Aimar Albar", jabatan: "Kadiv Basket", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "Basket", nim: "25.0301.0046", prodi: "BK S1", alamat: "Kleteran Rt 03/Rw 03, Grabag, Magelang", tanggalLahir: "2007-03-02", urutan: 80 },
    { nama: "Riska Fadhilah Nur Amali", jabatan: "Staff Basket", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Basket", nim: "24.0201.0023", prodi: "Ilmu Hukum S1", alamat: "Kwayuhan Rt 07/Rw 02, Gelangan, Magelang", tanggalLahir: "2005-02-25", urutan: 81 },
    { nama: "Difa Camillia Pramnesti", jabatan: "Staff Basket", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "Basket", nim: "24.0201.0084", prodi: "Ilmu Hukum S1", alamat: "Nasri, Rt 09/Rw 03, Grabag, Magelang", tanggalLahir: "2005-07-29", urutan: 82 },
    // Divisi E-sport
    { nama: "Hawkgi Arvel Putraning", jabatan: "Kadiv E-sport", kodeJabatan: "KADIV", kelompok: "Kadiv", divisi: "E-Sport", nim: "25.0504.0022", prodi: "Teknik Informatika S1", alamat: "Turus Rt 04/Rw 03, Tempurejo, Tempuran, Magelang", tanggalLahir: "2007-05-26", urutan: 90 },
    { nama: "Ayu Ventira D", jabatan: "Staff E-sport", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "E-Sport", nim: "25.0801.0039", prodi: "Psikologi S1", alamat: "Ngampel, Pandanretno, Srumbung, Magelang", tanggalLahir: "2007-11-01", urutan: 91 },
    { nama: "Muchamad Danang P", jabatan: "Staff E-sport", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "E-Sport", nim: "25.0504.0011", prodi: "Teknik Informatika S1", alamat: "Permata Depok Regency Cluster Jade E 26 No 2", tanggalLahir: "2006-10-31", urutan: 92 },
    { nama: "Miftakhul Rayhan Fathur", jabatan: "Staff E-sport", kodeJabatan: "STAFF_DIVISI", kelompok: "Staff Divisi", divisi: "E-Sport", nim: "25.0405.0011", prodi: "PAI S1", alamat: "Jurangsari Rt 04/Rw 09, Banjarnegoro, Mertoyudan", tanggalLahir: "2006-07-29", urutan: 93 },
  ];

  // Bersihkan data contoh struktur organisasi dari seed lama agar halaman
  // struktur hanya menampilkan kepengurusan resmi periode 2026/2027.
  await prisma.pengurus.deleteMany({
    where: {
      nama: { in: [
        "Prof. Dr. Ahmad Fauzi", "Muhammad Rizky", "Dewi Lestari", "Ahmad Fauzan",
        "Putri Anggraini", "Rafi Hidayat", "Nabila Putri", "Fajar Nugroho",
        "Bayu Saputra", "Andika Pratama", "Citra Ayu", "Reza Firmansyah",
        "Indah Permatasari", "Galih Prasetyo",
      ] },
    },
  });

  for (const p of pengurusData) {
    const data = {
      nama: p.nama, nim: p.nim, prodi: p.prodi, alamat: p.alamat,
      tanggalLahir: new Date(`${p.tanggalLahir}T00:00:00.000Z`), jabatan: p.jabatan,
      kodeJabatan: p.kodeJabatan, kelompok: p.kelompok, divisi: p.divisi || null,
      periodeMulai: PERIODE_PENGURUS_MULAI, urutan: p.urutan, userId: p.userId || undefined,
    };
    const existing = await prisma.pengurus.findFirst({ where: { nama: p.nama, periodeMulai: PERIODE_PENGURUS_MULAI } });
    if (existing) await prisma.pengurus.update({ where: { id: existing.id }, data });
    else await prisma.pengurus.create({ data });
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
