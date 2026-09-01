import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatUang } from "@/lib/utils";
import { FiCamera, FiDollarSign, FiMessageSquare } from "react-icons/fi";
import { getPeriodeSekarang, hitungKasPeriodik, getDataUlangTahun } from "@/lib/kas";
import KasNotifCard from "@/components/KasNotifCard";
import BirthdayPanel from "@/components/BirthdayPanel";

export const metadata = { title: "Akun Saya" };

export default async function AkunSayaPage() {
  const session = await auth();
  const anggota = await prisma.anggota.findUnique({
    where: { userId: (session!.user as any).id },
  });

  if (!anggota) {
    return <div className="card">Akun ini belum terhubung dengan data anggota. Hubungi admin UKM.</div>;
  }

  const [totalKas, kasTerverifikasi, komentarSaya, kasPeriodik, dataUlang] = await Promise.all([
    prisma.keuangan.count({ where: { anggotaId: anggota.id } }),
    prisma.keuangan.aggregate({ where: { anggotaId: anggota.id, status: "DIVERIFIKASI" }, _sum: { jumlah: true } }),
    prisma.komentarBarang.count({ where: { anggotaId: anggota.id } }),
    hitungKasPeriodik(anggota.id, null, getPeriodeSekarang()),
    getDataUlangTahun(),
  ]);

  const periode = getPeriodeSekarang();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold text-primary dark:text-white mb-1">Halo, {anggota.nama} 👋</h1>
        <p className="text-sm text-slate-500 mb-4">
          {anggota.prodi} · Angkatan {anggota.angkatan} · {anggota.divisi || "Belum ada divisi"} · Periode {anggota.periode || "-"}
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary dark:text-accent">{anggota.status}</div>
            <div className="text-xs text-slate-500">Status Keanggotaan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary dark:text-accent">{formatUang(kasTerverifikasi._sum.jumlah || 0)}</div>
            <div className="text-xs text-slate-500">Total Kas Terverifikasi</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary dark:text-accent">{komentarSaya}</div>
            <div className="text-xs text-slate-500">Pengajuan Barang</div>
          </div>
        </div>
      </div>

      <KasNotifCard
        terbayar={kasPeriodik.terbayar}
        sisa={kasPeriodik.sisa}
        periode={periode}
        nama={anggota.nama}
      />

      <BirthdayPanel orang={dataUlang} />

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/akun-saya/presensi" className="card glow-card flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-accent"><FiCamera /></div>
          <div>
            <p className="font-medium text-sm">Presensi Kegiatan</p>
            <p className="text-xs text-slate-400">Unggah foto dokumentasi</p>
          </div>
        </Link>
        <Link href="/akun-saya/kas" className="card glow-card flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-accent"><FiDollarSign /></div>
          <div>
            <p className="font-medium text-sm">Kas Saya</p>
            <p className="text-xs text-slate-400">Ajukan pembayaran kas</p>
          </div>
        </Link>
        <Link href="/akun-saya/barang" className="card glow-card flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-accent"><FiMessageSquare /></div>
          <div>
            <p className="font-medium text-sm">Lapor / Request Barang</p>
            <p className="text-xs text-slate-400">Hubungi Bidang Inventaris</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
