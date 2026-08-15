import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatTanggalWaktu } from "@/lib/utils";
import PresensiFotoPanel from "@/components/admin/PresensiFotoPanel";
import { FiArrowLeft } from "react-icons/fi";

export const metadata = { title: "Presensi Kegiatan" };

export default async function PresensiSayaDetailPage({ params }: { params: { agendaId: string } }) {
  const session = await auth();
  const agenda = await prisma.agenda.findUnique({ where: { id: params.agendaId } });
  if (!agenda) notFound();

  const foto = await prisma.presensiFoto.findMany({
    where: { agendaId: params.agendaId },
    select: {
      id: true, fotoUrl: true, keterangan: true, createdAt: true, diunggahOlehId: true,
      diunggahOleh: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Link href="/akun-saya/presensi" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark mb-4">
        <FiArrowLeft size={16} />
        Kembali
      </Link>

      <h1 className="text-xl font-bold text-primary dark:text-white mb-1">{agenda.judul}</h1>
      <p className="text-slate-500 mb-6 text-sm">{formatTanggalWaktu(agenda.tanggalMulai)} · {agenda.lokasi}</p>

      <div className="mb-8">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          Untuk menandai kehadiran Anda di kegiatan ini, <Link href={`/akun-saya/absensi/${agenda.id}`} className="text-primary hover:underline">klik di sini</Link>.
        </p>
      </div>

      <PresensiFotoPanel
        agendaId={agenda.id}
        initialData={JSON.parse(JSON.stringify(foto))}
        currentUserId={(session?.user as any)?.id}
        canDeleteAny={false}
      />
    </div>
  );
}
