import { prisma } from "@/lib/prisma";

export const KAS_PER_BULAN = 5000;
export const BULAN_KAS = 11;
export const TARGET_KAS = KAS_PER_BULAN * BULAN_KAS; // 55.000

export function getPeriodeSekarang(): string {
  const tahun = new Date().getFullYear();
  return `${tahun}/${tahun + 1}`;
}

export type StatusKasBulanan = {
  bayarBulanIni: boolean;
  bayarBulanLalu: boolean;
  sumBulanIni: number;
  sumBulanLalu: number;
  namaBulanIni: string;
  namaBulanLalu: string;
};

export async function hitungKasBulanan(anggotaId: string | null, pengurusId: string | null): Promise<StatusKasBulanan> {
  const now = new Date();
  const startBulanLalu = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startBulanIni = new Date(now.getFullYear(), now.getMonth(), 1);
  const startBulanDepan = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const kewajiban =
    anggotaId && pengurusId
      ? { OR: [{ anggotaId }, { pengurusId }] }
      : anggotaId
      ? { anggotaId }
      : pengurusId
      ? { pengurusId }
      : {};

  const payments = await prisma.keuangan.findMany({
    where: { status: "DIVERIFIKASI", ...kewajiban },
    select: { jumlah: true, tanggal: true },
  });

  const sumBulanLalu = payments
    .filter((p) => p.tanggal >= startBulanLalu && p.tanggal < startBulanIni)
    .reduce((s, p) => s + p.jumlah, 0);
  const sumBulanIni = payments
    .filter((p) => p.tanggal >= startBulanIni && p.tanggal < startBulanDepan)
    .reduce((s, p) => s + p.jumlah, 0);

  return {
    bayarBulanIni: sumBulanIni >= KAS_PER_BULAN,
    bayarBulanLalu: sumBulanLalu >= KAS_PER_BULAN,
    sumBulanIni,
    sumBulanLalu,
    namaBulanIni: startBulanIni.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    namaBulanLalu: startBulanLalu.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
  };
}

export async function hitungKasPeriodik(anggotaId: string | null, pengurusId: string | null, periode: string): Promise<{
  terbayar: number;
  sisa: number;
  target: number;
}> {
  const keuangan = await prisma.keuangan.findMany({
    where: {
      status: "DIVERIFIKASI",
      periode,
      OR: [
        ...(anggotaId ? [{ anggotaId }] : []),
        ...(pengurusId ? [{ pengurusId }] : []),
      ],
    },
    select: { jumlah: true },
  });

  const terbayar = keuangan.reduce((s, k) => s + k.jumlah, 0);
  const sisa = Math.max(TARGET_KAS - terbayar, 0);

  return { terbayar, sisa, target: TARGET_KAS };
}

export async function cariUlangTahun() {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tanggal = now.getDate();

  const anggota = await prisma.anggota.findMany({
    where: {
      status: "Aktif",
      tanggalLahir: {
        not: null,
      },
    },
    select: {
      id: true,
      nama: true,
      tanggalLahir: true,
      foto: true,
      _count: { select: { ucapan: true } },
    },
  });

  const pengurus = await prisma.pengurus.findMany({
    where: {
      isActive: true,
      tanggalLahir: {
        not: null,
      },
    },
    select: {
      id: true,
      nama: true,
      jabatan: true,
      tanggalLahir: true,
      foto: true,
      _count: { select: { ucapan: true } },
    },
  });

  const hasil: {
    id: string;
    nama: string;
    tipe: "ANGGOTA" | "PENGURUS";
    jabatan?: string;
    foto?: string | null;
    jumlahUcapan: number;
  }[] = [];

  for (const a of anggota) {
    const tgl = a.tanggalLahir as Date;
    if (tgl.getMonth() + 1 === bulan && tgl.getDate() === tanggal) {
      hasil.push({
        id: a.id,
        nama: a.nama,
        tipe: "ANGGOTA",
        foto: a.foto,
        jumlahUcapan: a._count.ucapan,
      });
    }
  }

  for (const p of pengurus) {
    const tgl = p.tanggalLahir as Date;
    if (tgl.getMonth() + 1 === bulan && tgl.getDate() === tanggal) {
      hasil.push({
        id: p.id,
        nama: p.nama,
        tipe: "PENGURUS",
        jabatan: p.jabatan,
        foto: p.foto,
        jumlahUcapan: p._count.ucapan,
      });
    }
  }

  return hasil;
}

export type OrangUlangTahun = {
  id: string;
  nama: string;
  tipe: "ANGGOTA" | "PENGURUS";
  jabatan?: string;
  foto?: string | null;
  ucapan: { id: string; pengirim: string; pesan: string; createdAt: string }[];
};

export async function getDataUlangTahun(): Promise<OrangUlangTahun[]> {
  const daftar = await cariUlangTahun();
  const hasil: OrangUlangTahun[] = [];

  for (const o of daftar) {
    let ucapan;
    if (o.tipe === "PENGURUS") {
      ucapan = await prisma.ucapan.findMany({ where: { pengurusId: o.id }, orderBy: { createdAt: "desc" } });
    } else {
      ucapan = await prisma.ucapan.findMany({ where: { anggotaId: o.id }, orderBy: { createdAt: "desc" } });
    }

    hasil.push({
      id: o.id,
      nama: o.nama,
      tipe: o.tipe,
      jabatan: o.jabatan,
      foto: o.foto,
      ucapan: ucapan.map((u) => ({
        id: u.id,
        pengirim: u.pengirim,
        pesan: u.pesan,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  }

  return hasil;
}
