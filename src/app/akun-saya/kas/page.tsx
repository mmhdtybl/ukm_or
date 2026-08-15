import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import KasSayaClient from "./KasSayaClient";

export const metadata = { title: "Kas Saya" };

export default async function KasSayaPage() {
  const session = await auth();
  const anggota = await prisma.anggota.findUnique({ where: { userId: (session!.user as any).id } });

  if (!anggota) return <div className="card">Akun ini belum terhubung dengan data anggota.</div>;

  const riwayat = await prisma.keuangan.findMany({
    where: { anggotaId: anggota.id },
    orderBy: { tanggal: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-primary dark:text-white mb-1">Kas Saya</h1>
      <p className="text-sm text-slate-500 mb-6">Ajukan laporan pembayaran kas rutin. Laporan akan diverifikasi oleh Bendahara.</p>
      <KasSayaClient riwayat={JSON.parse(JSON.stringify(riwayat))} />
    </div>
  );
}
