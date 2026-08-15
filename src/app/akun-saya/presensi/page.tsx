import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatTanggal } from "@/lib/utils";
import { FiCamera, FiCheckCircle, FiClock } from "react-icons/fi";

export const metadata = { title: "Presensi Kegiatan" };

export default async function PresensiSayaPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = (session.user as any).id;

  // Ambil semua kegiatan dengan status absensi user
  const agendaList = await prisma.agenda.findMany({
    orderBy: { tanggalMulai: "desc" },
    take: 15,
    include: {
      _count: { select: { presensiFoto: true } },
      absensiAnggota: {
        where: { userId },
        select: { id: true, status: true, fotoUrl: true, createdAt: true },
      },
    },
  });

  return (
    <div className="card">
      <h1 className="text-xl font-bold text-primary dark:text-white mb-1">Presensi Kegiatan</h1>
      <p className="text-sm text-slate-500 mb-6">
        Tandai kehadiran Anda di setiap kegiatan. Anda juga dapat melihat daftar teman yang sudah hadir.
      </p>

      <div className="space-y-3">
        {agendaList.map((a) => {
          const userAbsensi = a.absensiAnggota[0];
          const isAbsen = !!userAbsensi;

          return (
            <Link
              key={a.id}
              href={`/akun-saya/absensi/${a.id}`}
              className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 hover:text-primary dark:hover:text-accent transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{a.judul}</p>
                <p className="text-xs text-slate-400">{formatTanggal(a.tanggalMulai)} · {a.lokasi}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAbsen && (
                  <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                    <FiCheckCircle size={12} /> Hadir
                  </span>
                )}
                <span className="badge bg-primary/10 text-primary dark:bg-white/10 dark:text-accent flex items-center gap-1">
                  <FiCamera size={12} /> {a._count.presensiFoto}
                </span>
              </div>
            </Link>
          );
        })}
        {agendaList.length === 0 && <p className="text-slate-400 text-sm">Belum ada kegiatan.</p>}
      </div>
    </div>
  );
}
