import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatTanggal } from "@/lib/utils";
import { getKapabilitas } from "@/lib/permissions";
import KameraPresensi from "@/components/KameraPresensi";

export const metadata = {
  title: "Presensi Kegiatan",
};

export default async function PresensiAgendaPage({
  params,
}: {
  params: { agendaId: string };
}) {
  // Cek hak akses
  const kap = await getKapabilitas();

  if (!kap?.canUploadPresensi) {
    redirect("/dashboard");
  }

  // Ambil data kegiatan
  const agenda = await prisma.agenda.findUnique({
    where: {
      id: params.agendaId,
    },
  });

  // Jika kegiatan tidak ditemukan
  if (!agenda) {
    notFound();
  }

  const fotoSudahAda = await prisma.presensiFoto.count({ where: { agendaId: agenda.id } });
  if (fotoSudahAda > 0) {
    redirect("/dashboard/presensi");
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link
          href="/dashboard/presensi"
          className="inline-flex items-center text-sm text-slate-500 hover:text-primary dark:hover:text-accent mb-4"
        >
          ← Kembali ke Presensi
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white">
          Presensi Kegiatan
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Ambil foto kegiatan sebagai bukti dokumentasi presensi.
        </p>
      </div>

      {/* INFORMASI KEGIATAN */}
      <div className="card">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Kegiatan
          </p>

          <h2 className="text-xl font-bold text-primary dark:text-white">
            {agenda.judul}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          <div className="rounded-xl bg-surface-light dark:bg-white/5 p-4">
            <p className="text-xs text-slate-400 mb-1">
              Tanggal
            </p>

            <p className="font-medium text-slate-700 dark:text-slate-200">
              {formatTanggal(agenda.tanggalMulai)}
            </p>
          </div>

          <div className="rounded-xl bg-surface-light dark:bg-white/5 p-4">
            <p className="text-xs text-slate-400 mb-1">
              Lokasi
            </p>

            <p className="font-medium text-slate-700 dark:text-slate-200">
              {agenda.lokasi}
            </p>
          </div>

        </div>
      </div>

      {/* KAMERA */}
      <div className="card">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-primary dark:text-white">
            Dokumentasi Presensi
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gunakan kamera perangkat untuk mengambil foto kegiatan,
            atau pilih foto dari perangkat.
          </p>
        </div>

        <KameraPresensi
          agendaId={agenda.id}
        />

      </div>

    </div>
  );
}