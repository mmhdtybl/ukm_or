import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import BarangManager from "@/components/admin/BarangManager";

export const metadata = { title: "Kelola Inventaris Barang" };

export default async function KelolaBarangPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageBarang) redirect("/dashboard");

  const [barang, komentar] = await Promise.all([
    prisma.barang.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.komentarBarang.findMany({
      include: { anggota: { select: { nama: true, nim: true } }, barang: { select: { nama: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Kelola Inventaris Barang</h1>
      <p className="text-slate-500 mb-6">Kelola data barang UKM (bola, perlengkapan, dll) dan tindak lanjuti laporan/permintaan dari anggota.</p>
      <BarangManager initialBarang={JSON.parse(JSON.stringify(barang))} initialKomentar={JSON.parse(JSON.stringify(komentar))} />
    </div>
  );
}
