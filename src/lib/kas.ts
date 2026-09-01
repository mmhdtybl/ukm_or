import { prisma } from "@/lib/prisma";

export const KAS_PER_BULAN = 5000;
export const BULAN_KAS = 11;
export const TARGET_KAS = KAS_PER_BULAN * BULAN_KAS; // 55.000

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function keyOfBulan(tahun: number, bulanIndex: number): string {
  return `${tahun}-${pad2(bulanIndex + 1)}`;
}

// Periode kas = tahun akademik Indonesia: Agustus s.d. Juni (11 bulan).
export function getTahunAkademik(now: Date = new Date()): { mulai: number; akhir: number; label: string } {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11; Agustus = 7
  if (m >= 7) {
    return { mulai: y, akhir: y + 1, label: `${y}/${y + 1}` };
  }
  return { mulai: y - 1, akhir: y, label: `${y - 1}/${y}` };
}

export function getPeriodeSekarang(): string {
  return getTahunAkademik().label;
}

// Daftar 11 bulan kas periode berjalan (Agustus s.d. Juni).
export function getBulanKasList(now: Date = new Date()): { key: string; label: string }[] {
  const { mulai, akhir } = getTahunAkademik(now);
  const list: { key: string; label: string }[] = [];
  for (let m = 7; m <= 11; m++) {
    list.push({ key: keyOfBulan(mulai, m), label: `${NAMA_BULAN[m]} ${mulai}` });
  }
  for (let m = 0; m <= 5; m++) {
    list.push({ key: keyOfBulan(akhir, m), label: `${NAMA_BULAN[m]} ${akhir}` });
  }
  return list;
}

export type StatusBulanKas = {
  key: string;
  label: string;
  jumlah: number;
  metode: string | null;
  keterangan: string | null;
  lunas: boolean;
};

export function kewajibanKas(anggotaId: string | null, pengurusId: string | null) {
  if (anggotaId && pengurusId) return { OR: [{ anggotaId }, { pengurusId }] };
  if (anggotaId) return { anggotaId };
  if (pengurusId) return { pengurusId };
  return {};
}

// Tabel kas 11 bulan milik user: masing-masing bulan menampilkan total &
// status lunas/belum. Bulan dari laporan lama tanpa bulanTagih diambil dari tanggal.
export async function getKasBulanUser(anggotaId: string | null, pengurusId: string | null): Promise<StatusBulanKas[]> {
  const list = getBulanKasList();
  const map = new Map<string, StatusBulanKas>();
  for (const m of list) {
    map.set(m.key, { ...m, jumlah: 0, metode: null, keterangan: null, lunas: false });
  }

  const payments = await prisma.keuangan.findMany({
    where: { status: "DIVERIFIKASI", ...kewajibanKas(anggotaId, pengurusId) },
    select: { jumlah: true, metode: true, keterangan: true, tanggal: true, bulanTagih: true },
  });

  for (const p of payments) {
    const key = p.bulanTagih || (p.tanggal ? keyOfBulan(p.tanggal.getFullYear(), p.tanggal.getMonth()) : null);
    if (!key) continue;
    const row = map.get(key);
    if (!row) continue;
    row.jumlah += p.jumlah;
    row.metode = p.metode || row.metode;
    row.keterangan = p.keterangan || row.keterangan;
  }

  for (const row of map.values()) {
    row.lunas = row.jumlah >= KAS_PER_BULAN;
  }

  return [...map.values()];
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
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const keyIni = keyOfBulan(now.getFullYear(), now.getMonth());
  const keyLalu = keyOfBulan(prev.getFullYear(), prev.getMonth());

  const rows = await getKasBulanUser(anggotaId, pengurusId);
  const cur = rows.find((r) => r.key === keyIni);
  const lalu = rows.find((r) => r.key === keyLalu);

  return {
    bayarBulanIni: cur?.lunas ?? false,
    bayarBulanLalu: lalu?.lunas ?? false,
    sumBulanIni: cur?.jumlah ?? 0,
    sumBulanLalu: lalu?.jumlah ?? 0,
    namaBulanIni: cur?.label ?? "Bulan ini",
    namaBulanLalu: lalu?.label ?? "Bulan lalu",
  };
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
