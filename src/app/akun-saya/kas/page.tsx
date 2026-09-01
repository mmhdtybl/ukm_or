import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";
import { getKasConfig } from "@/lib/kas-config";
import { getBulanKasList, getKasBulanUser } from "@/lib/kas";
import KasSayaClient from "./KasSayaClient";

export const metadata = { title: "Kas Saya" };

export default async function KasSayaPage() {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return null;

  if (kap.isAdmin || kap.isDPO) {
    return <div className="card">Anda tidak memiliki akses ke halaman ini.</div>;
  }

  const userId = (session.user as any).id;
  const anggota = await prisma.anggota.findUnique({ where: { userId } });
  const pengurus = await prisma.pengurus.findUnique({ where: { userId } });

  if (!anggota && !pengurus) {
    return <div className="card">Akun ini belum terhubung dengan data anggota/pengurus.</div>;
  }

  const [bulanKas, konfigurasi] = await Promise.all([
    getKasBulanUser(anggota?.id ?? null, pengurus?.id ?? null),
    getKasConfig(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-primary dark:text-white mb-1">Kas Saya</h1>
      <p className="text-sm text-slate-500 mb-6">Ajukan laporan pembayaran kas rutin. Laporan akan diverifikasi oleh Bendahara.</p>
      <KasSayaClient
        bulanKas={JSON.parse(JSON.stringify(bulanKas))}
        bulanList={getBulanKasList()}
        tujuan={konfigurasi?.tujuan || null}
      />
    </div>
  );
}
