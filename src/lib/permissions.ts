import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// =====================================================
// KODE JABATAN
// =====================================================

export type KodeJabatan =
  | "DPO"
  | "KETUA_UMUM"
  | "WAKIL_KETUA"
  | "SEKRETARIS"
  | "BENDAHARA"
  | "BIDANG_SDM"
  | "BIDANG_INVENTARIS"
  | "BIDANG_MEDIA"
  | "KADIV"
  | "STAFF_DIVISI";

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
  STAFF_DIVISI: "Staff Divisi Cabang Olahraga",
};

// =====================================================
// TIPE KAPABILITAS
// =====================================================

export type Kapabilitas = {
  role: "ADMIN" | "PENGURUS" | "ANGGOTA";

  kodeJabatan: KodeJabatan | null;
  namaJabatan: string | null;

  isAdmin: boolean;
  isKetuaOrWakil: boolean;
  isDPO: boolean;

  canManageAnggota: boolean;
  canManagePengurus: boolean;
  canManageEvent: boolean;
  canManageBerita: boolean;
  canManageArsip: boolean;
  canManageFileUnduhan: boolean;
  canManageKeuangan: boolean;
  canManageBarang: boolean;
  canManageGaleriStruktur: boolean;
  canManageProfilWeb: boolean;
  canManageKontak: boolean;
  canManageDivisiStaff: boolean;

  // Presensi
  canUploadPresensi: boolean;
  canViewPresensi: boolean;
  canViewRanking: boolean;

  // Lainnya
  canKelolaKas: boolean;
  canKomentarBarang: boolean;

  divisiScope: string | null;
  viewOnly: boolean;
};

// =====================================================
// GET KAPABILITAS
// =====================================================

export async function getKapabilitas(): Promise<Kapabilitas | null> {
  const session = await auth();

  if (!session) return null;

  const role = (session.user as any).role as
    | "ADMIN"
    | "PENGURUS"
    | "ANGGOTA";

  const userId = (session.user as any).id as string;

  // =====================================================
  // ADMIN
  // =====================================================

  if (role === "ADMIN") {
    return {
      role,

      kodeJabatan: null,
      namaJabatan: "Administrator",

      isAdmin: true,
      isKetuaOrWakil: true,
      isDPO: false,

      canManageAnggota: true,
      canManagePengurus: true,
      canManageEvent: true,
      canManageBerita: true,
      canManageArsip: true,
      canManageFileUnduhan: true,
      canManageKeuangan: true,
      canManageBarang: true,
      canManageGaleriStruktur: true,
      canManageProfilWeb: true,
      canManageKontak: true,
      canManageDivisiStaff: true,

      // Admin tidak boleh presensi
      canUploadPresensi: false,

      // Tapi boleh melihat semuanya
      canViewPresensi: true,
      canViewRanking: true,

      canKelolaKas: false,
      canKomentarBarang: false,

      divisiScope: null,
      viewOnly: false,
    };
  }

  // =====================================================
  // PENGURUS
  // =====================================================

  if (role === "PENGURUS") {
    const pengurus = await prisma.pengurus.findUnique({
      where: { userId },
    });

    const kode = (pengurus?.kodeJabatan as KodeJabatan) || "KADIV";

    const isKetuaOrWakil =
      kode === "KETUA_UMUM" || kode === "WAKIL_KETUA";

    const isDPO = kode === "DPO";

    return {
      role,

      kodeJabatan: kode,
      namaJabatan:
        pengurus?.jabatan || KODE_JABATAN_LABEL[kode],

      isAdmin: false,
      isKetuaOrWakil,
      isDPO,

      canManageAnggota:
        isKetuaOrWakil || kode === "BIDANG_SDM",

      canManagePengurus:
        isKetuaOrWakil,

      canManageEvent:
        isKetuaOrWakil || kode === "BIDANG_SDM",

      canManageBerita:
        isKetuaOrWakil || kode === "BIDANG_MEDIA",

      canManageArsip:
        isKetuaOrWakil || kode === "SEKRETARIS",

      canManageFileUnduhan:
        isKetuaOrWakil || kode === "SEKRETARIS",

      canManageKeuangan:
        isKetuaOrWakil || kode === "BENDAHARA",

      canManageBarang:
        isKetuaOrWakil || kode === "BIDANG_INVENTARIS",

      canManageGaleriStruktur:
        isKetuaOrWakil || kode === "BIDANG_MEDIA",

      canManageProfilWeb:
        isKetuaOrWakil,

      canManageKontak:
        isKetuaOrWakil || kode === "SEKRETARIS",

      canManageDivisiStaff:
        isKetuaOrWakil || kode === "KADIV",

      // DPO tidak boleh presensi
      canUploadPresensi: !isDPO,

      // Semua pengurus boleh melihat presensi & ranking
      canViewPresensi: true,
      canViewRanking: true,

      canKelolaKas: false,
      canKomentarBarang: false,

      divisiScope:
        kode === "KADIV" || kode === "STAFF_DIVISI"
          ? pengurus?.divisi || null
          : null,

      viewOnly: isDPO,
    };
  }

  // =====================================================
  // ANGGOTA
  // =====================================================

  return {
    role,

    kodeJabatan: null,
    namaJabatan: "Anggota",

    isAdmin: false,
    isKetuaOrWakil: false,
    isDPO: false,

    canManageAnggota: false,
    canManagePengurus: false,
    canManageEvent: false,
    canManageBerita: false,
    canManageArsip: false,
    canManageFileUnduhan: false,
    canManageKeuangan: false,
    canManageBarang: false,
    canManageGaleriStruktur: false,
    canManageProfilWeb: false,
    canManageKontak: false,
    canManageDivisiStaff: false,

    // Anggota boleh presensi
    canUploadPresensi: true,

    // Dan boleh melihat semuanya
    canViewPresensi: true,
    canViewRanking: true,

    canKelolaKas: true,
    canKomentarBarang: true,

    divisiScope: null,

    viewOnly: true,
  };
}