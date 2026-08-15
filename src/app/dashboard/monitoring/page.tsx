import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import { formatTanggal, formatUang } from "@/lib/utils";

export const metadata = { title: "Monitoring DPO" };

export default async function MonitoringPage() {
  const kap = await getKapabilitas();
  if (!kap?.isDPO && !kap?.isAdmin) redirect("/dashboard");

  const [anggota, pengurus, keuangan, arsip, barang, agenda] = await Promise.all([
    prisma.anggota.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.pengurus.findMany({ orderBy: { urutan: "asc" } }),
    prisma.keuangan.findMany({ orderBy: { tanggal: "desc" }, take: 10 }),
    prisma.arsip.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.barang.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.agenda.findMany({ orderBy: { tanggalMulai: "desc" }, take: 10 }),
  ]);

  const totalMasuk = await prisma.keuangan.aggregate({ where: { jenis: "MASUK", status: "DIVERIFIKASI" }, _sum: { jumlah: true } });
  const totalKeluar = await prisma.keuangan.aggregate({ where: { jenis: "KELUAR", status: "DIVERIFIKASI" }, _sum: { jumlah: true } });
  const saldo = (totalMasuk._sum.jumlah || 0) - (totalKeluar._sum.jumlah || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Monitoring (Mode Hanya Lihat)</h1>
      <p className="text-slate-500 mb-6">Sebagai DPO, Anda dapat memantau seluruh aktivitas anggota dan pengurus tanpa dapat mengubah data.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Ringkasan Kas — Saldo: {formatUang(saldo)}</h3>
          <div className="space-y-2">
            {keuangan.map((k) => (
              <div key={k.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>{k.kategori}</span>
                <span className={k.jenis === "MASUK" ? "text-green-600" : "text-red-500"}>{formatUang(k.jumlah)}</span>
              </div>
            ))}
            {keuangan.length === 0 && <p className="text-slate-400 text-sm">Belum ada transaksi.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Pengurus Aktif ({pengurus.length})</h3>
          <div className="space-y-2">
            {pengurus.map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>{p.nama}</span>
                <span className="text-slate-400">{p.jabatan}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Anggota Terbaru</h3>
          <div className="space-y-2">
            {anggota.map((a) => (
              <div key={a.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>{a.nama} ({a.nim})</span>
                <span className="text-slate-400">{a.divisi || "-"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Kondisi Barang Inventaris</h3>
          <div className="space-y-2">
            {barang.map((b) => (
              <div key={b.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>{b.nama}</span>
                <span className={b.kondisi === "Baik" ? "text-green-600" : "text-red-500"}>{b.kondisi}</span>
              </div>
            ))}
            {barang.length === 0 && <p className="text-slate-400 text-sm">Belum ada data barang.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Arsip Terbaru</h3>
          <div className="space-y-2">
            {arsip.map((f) => (
              <div key={f.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>{f.judul}</span>
                <span className="text-slate-400">{formatTanggal(f.createdAt)}</span>
              </div>
            ))}
            {arsip.length === 0 && <p className="text-slate-400 text-sm">Belum ada arsip.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Agenda Terbaru</h3>
          <div className="space-y-2">
            {agenda.map((a) => (
              <div key={a.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>{a.judul}</span>
                <span className="text-slate-400">{formatTanggal(a.tanggalMulai)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
