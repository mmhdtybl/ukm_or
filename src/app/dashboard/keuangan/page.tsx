import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import KeuanganManager from "@/components/admin/KeuanganManager";

export const metadata = { title: "Kelola Keuangan" };

export default async function KelolaKeuanganPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageKeuangan) redirect("/dashboard");

  const keuangan = await prisma.keuangan.findMany({
    include: { anggota: { select: { nama: true, nim: true } }, dicatatOleh: { select: { name: true } } },
    orderBy: { tanggal: "desc" },
  });

  const totalMasuk = keuangan.filter((k) => k.jenis === "MASUK" && k.status === "DIVERIFIKASI").reduce((s, k) => s + k.jumlah, 0);
  const totalKeluar = keuangan.filter((k) => k.jenis === "KELUAR" && k.status === "DIVERIFIKASI").reduce((s, k) => s + k.jumlah, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Kelola Kas & Keuangan</h1>
      <p className="text-slate-500 mb-6">Catat pemasukan/pengeluaran dan verifikasi laporan pembayaran kas dari anggota.</p>
      <KeuanganManager
        initialData={JSON.parse(JSON.stringify(keuangan))}
        saldo={totalMasuk - totalKeluar}
        totalMasuk={totalMasuk}
        totalKeluar={totalKeluar}
      />
    </div>
  );
}
