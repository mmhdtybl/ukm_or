import { prisma } from "@/lib/prisma";

export const KAS_PER_BULAN = 5000;
export const BULAN_KAS = 11;
export const TARGET_KAS = KAS_PER_BULAN * BULAN_KAS; // 55.000

export function getPeriodeSekarang(): string {
  const tahun = new Date().getFullYear();
  return `${tahun}/${tahun + 1}`;
}

type KasRetribusiAnggota = { anggotaId: string | null; pengurusId: string | null };

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
