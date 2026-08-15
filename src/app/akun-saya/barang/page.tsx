import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import BarangSayaClient from "./BarangSayaClient";

export const metadata = { title: "Lapor / Request Barang" };

export default async function BarangSayaPage() {
  const session = await auth();
  const anggota = await prisma.anggota.findUnique({ where: { userId: (session!.user as any).id } });

  const [barang, komentarSaya] = await Promise.all([
    prisma.barang.findMany({ orderBy: { nama: "asc" } }),
    anggota
      ? prisma.komentarBarang.findMany({
          where: { anggotaId: anggota.id },
          include: { barang: { select: { nama: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-primary dark:text-white mb-1">Lapor / Request Barang</h1>
      <p className="text-sm text-slate-500 mb-6">Lihat daftar barang UKM, ajukan permintaan barang baru, atau laporkan barang yang rusak ke Bidang Inventaris.</p>
      <BarangSayaClient barang={JSON.parse(JSON.stringify(barang))} komentarSaya={JSON.parse(JSON.stringify(komentarSaya))} />
    </div>
  );
}
