import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import KeuanganManager from "@/components/admin/KeuanganManager";

export const metadata = { title: "Kelola Keuangan" };

export default async function KelolaKeuanganPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageKeuangan) redirect("/dashboard");

  const keuangan = await prisma.keuangan.findMany({
    include: {
      anggota: { select: { nama: true, nim: true } },
      pengurus: { select: { nama: true, nim: true } },
      dicatatOleh: { select: { name: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Kelola Keuangan</h1>
      <p className="text-slate-500 mb-6">Catat pemasukan dan pengeluaran keuangan organisasi.</p>
      <KeuanganManager
        initialData={JSON.parse(JSON.stringify(keuangan))}
      />
    </div>
  );
}
