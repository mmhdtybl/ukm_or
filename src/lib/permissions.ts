import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kode jabatan pengurus yang dipakai untuk logika hak akses (bukan sekadar label tampilan)
export type KodeJabatan =
  | "DPO"
  | "KETUA_UMUM"
  | "WAKIL_KETUA"
  | "SEKRETARIS"
  | "BENDAHARA"
  | "BIDANG_SDM"
  | "BIDANG_INVENTARIS"
  | "BIDANG_MEDIA"
  | "KADIV";

export const KODE_JABATAN_LABEL: Record<KodeJabatan, string> = {
  DPO: "DPO (Dewan Pertimbangan Organisasi)",
  KETUA_UMUM: "Ketua Umum",
  WAKIL_KETUA: "Wakil Ketua Umum",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  BIDANG_SDM: "Bidang SDM",
  BIDANG_INVENTARIS: "Bidang Inventaris",
  BIDANG_MEDIA: "Bidang Media Informasi",
  KADIV: "Kepala Divisi (Kadiv)",
};

export type Kapabilitas = {
  role: "ADMIN" | "PENGURUS" | "ANGGOTA";
  kodeJabatan: KodeJabatan | null;
  namaJabatan: string | null;
  isAdmin: boolean;
  isKetuaOrWakil: boolean;
  isDPO: boolean;
  canManageAnggota: boolean;         // buat/edit/hapus data anggota & buatkan akun login (lingkup semua divisi)
  canManagePengurus: boolean;        // CRUD data pengurus & struktur organisasi
  canManageEvent: boolean;           // CRUD agenda/kegiatan
  canManageBerita: boolean;          // CRUD berita
  canManageArsip: boolean;           // upload/hapus arsip (Sekretaris)
  canManageFileUnduhan: boolean;     // upload/hapus file unduhan publik (AD/ART, proposal)
  canManageKeuangan: boolean;        // catat & verifikasi kas (Bendahara)
  canManageBarang: boolean;          // CRUD inventaris barang (Bidang Inventaris)
  canManageGaleriStruktur: boolean;  // CRUD galeri & foto struktur (Bidang Media)
  canManageProfilWeb: boolean;       // ubah ketentuan/pengaturan website (banner, profil UKM)
  canManageKontak: boolean;          // lihat & kelola pesan kontak masuk
  canManageDivisiStaff: boolean;     // Kadiv: kelola staff divisinya sendiri (lingkup divisi saja)
  canUploadPresensi: boolean;        // unggah foto dokumentasi kegiatan
  canKelolaKas: boolean;             // ajukan/bayar kas pribadi (anggota & staff)
  canKomentarBarang: boolean;        // request/lapor barang ke inventaris (anggota & staff)
  divisiScope: string | null;        // jika Kadiv, dibatasi ke divisi ini saja
  viewOnly: boolean;                 // DPO & Anggota: hanya lihat + presensi/kas/komentar
};

export async function getKapabilitas(): Promise<Kapabilitas | null> {
  const session = await auth();
  if (!session) return null;

  const role = (session.user as any).role as "ADMIN" | "PENGURUS" | "ANGGOTA";
  const userId = (session.user as any).id as string;

  if (role === "ADMIN") {
    return {
      role, kodeJabatan: null, namaJabatan: "Administrator",
      isAdmin: true, isKetuaOrWakil: true, isDPO: false,
      canManageAnggota: true, canManagePengurus: true, canManageEvent: true, canManageBerita: true,
      canManageArsip: true, canManageFileUnduhan: true, canManageKeuangan: true, canManageBarang: true,
      canManageGaleriStruktur: true, canManageProfilWeb: true, canManageKontak: true,
      canManageDivisiStaff: true, canUploadPresensi: true, canKelolaKas: false, canKomentarBarang: false,
      divisiScope: null, viewOnly: false,
    };
  }

  if (role === "PENGURUS") {
    const pengurus = await prisma.pengurus.findUnique({ where: { userId } });
    const kode = (pengurus?.kodeJabatan as KodeJabatan) || "KADIV";
    const isKetuaOrWakil = kode === "KETUA_UMUM" || kode === "WAKIL_KETUA";
    const isDPO = kode === "DPO";

    return {
      role, kodeJabatan: kode, namaJabatan: pengurus?.jabatan || KODE_JABATAN_LABEL[kode],
      isAdmin: false, isKetuaOrWakil, isDPO,
      canManageAnggota: isKetuaOrWakil || kode === "BIDANG_SDM",
      canManagePengurus: isKetuaOrWakil,
      canManageEvent: isKetuaOrWakil || kode === "BIDANG_SDM",
      canManageBerita: isKetuaOrWakil || kode === "BIDANG_MEDIA",
      canManageArsip: isKetuaOrWakil || kode === "SEKRETARIS",
      canManageFileUnduhan: isKetuaOrWakil || kode === "SEKRETARIS",
      canManageKeuangan: isKetuaOrWakil || kode === "BENDAHARA",
      canManageBarang: isKetuaOrWakil || kode === "BIDANG_INVENTARIS",
      canManageGaleriStruktur: isKetuaOrWakil || kode === "BIDANG_MEDIA",
      canManageProfilWeb: isKetuaOrWakil,
      canManageKontak: isKetuaOrWakil || kode === "SEKRETARIS",
      canManageDivisiStaff: isKetuaOrWakil || kode === "KADIV",
      canUploadPresensi: !isDPO,
      canKelolaKas: false,
      canKomentarBarang: false,
      divisiScope: kode === "KADIV" ? pengurus?.divisi || null : null,
      viewOnly: isDPO,
    };
  }

  // ANGGOTA / staff biasa: hanya lihat, presensi, bayar/lapor kas, komentar ke inventaris
  return {
    role, kodeJabatan: null, namaJabatan: "Anggota",
    isAdmin: false, isKetuaOrWakil: false, isDPO: false,
    canManageAnggota: false, canManagePengurus: false, canManageEvent: false, canManageBerita: false,
    canManageArsip: false, canManageFileUnduhan: false, canManageKeuangan: false, canManageBarang: false,
    canManageGaleriStruktur: false, canManageProfilWeb: false, canManageKontak: false,
    canManageDivisiStaff: false, canUploadPresensi: true, canKelolaKas: true, canKomentarBarang: true,
    divisiScope: null, viewOnly: true,
  };
}
