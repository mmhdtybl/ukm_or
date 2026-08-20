import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatTanggal } from "@/lib/utils";
import { getKapabilitas } from "@/lib/permissions";
import KameraPresensi from "@/components/KameraPresensi";
import {
  FiArrowLeft,
  FiCamera,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiImage,
} from "react-icons/fi";

export const metadata = {
  title: "Detail Presensi Kegiatan",
};

export default async function PresensiAgendaPage({
  params,
}: {
  params: { agendaId: string };
}) {
  const kap = await getKapabilitas();

  const agenda = await prisma.agenda.findUnique({
    where: {
      id: params.agendaId,
    },
    include: {
      absensiAnggota: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      presensiFoto: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!agenda) {
    notFound();
  }

  const total =
    agenda.absensiAnggota.length;

  const hadir =
    agenda.absensiAnggota.filter(
      (a) => a.status === "HADIR"
    ).length;

  const izin =
    agenda.absensiAnggota.filter(
      (a) => a.status === "IZIN"
    ).length;

  const ranking =
    agenda.absensiAnggota.filter(
      (a) => a.status === "HADIR"
    );

  const fotoPresensi =
    agenda.absensiAnggota.filter(
      (a) => Boolean(a.fotoUrl)
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <div>
        <Link
          href="/dashboard/presensi"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-4"
        >
          <FiArrowLeft />
          Kembali ke Dashboard Presensi
        </Link>

        <h1 className="text-3xl font-bold text-primary dark:text-white">
          Detail Presensi Kegiatan
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Semua pengguna dapat melihat statistik,
          ranking, dan dokumentasi kegiatan.
        </p>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">
          {agenda.judul}
        </h2>

        <p className="text-slate-500">
          {formatTanggal(
            agenda.tanggalMulai
          )}
        </p>

        <p className="text-slate-500">
          {agenda.lokasi}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="card text-center">
          <FiUsers
            className="mx-auto mb-2"
            size={24}
          />

          <p className="text-2xl font-bold">
            {total}
          </p>

          <p className="text-sm text-slate-500">
            Total
          </p>
        </div>

        <div className="card text-center">
          <FiCheckCircle
            className="mx-auto mb-2 text-green-500"
            size={24}
          />

          <p className="text-2xl font-bold">
            {hadir}
          </p>

          <p className="text-sm text-slate-500">
            Hadir
          </p>
        </div>

        <div className="card text-center">
          <FiClock
            className="mx-auto mb-2 text-blue-500"
            size={24}
          />

          <p className="text-2xl font-bold">
            {izin}
          </p>

          <p className="text-sm text-slate-500">
            Izin
          </p>
        </div>

        <div className="card text-center">
          <FiImage
            className="mx-auto mb-2 text-amber-500"
            size={24}
          />

          <p className="text-2xl font-bold">
            {fotoPresensi.length}
          </p>

          <p className="text-sm text-slate-500">
            Foto Presensi
          </p>
        </div>

      </div>

      <div className="card">

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FiAward className="text-yellow-500" />
          Top 10 Datang Paling Awal
        </h2>

        {ranking.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Belum ada peserta yang hadir.
          </p>
        ) : (
          <div className="space-y-3">

            {ranking.slice(0, 10).map(
              (item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                >

                  <div className="flex items-center gap-3">

                    <div className="text-2xl">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {item.user.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.user.role}
                      </p>
                    </div>

                  </div>

                  <span className="text-sm">
                    {new Date(
                      item.createdAt
                    ).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {kap?.canUploadPresensi && (
        <div className="card">

          <div className="mb-5">

            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiCamera />
              Ambil Presensi
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Gunakan kamera untuk mengambil foto
              kehadiran di lokasi kegiatan.
            </p>

          </div>

          <KameraPresensi
            agendaId={agenda.id}
          />

        </div>
      )}

      {!kap?.canUploadPresensi && (
        <div className="card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">

          <p className="font-semibold text-amber-700 dark:text-amber-300">
            Admin dan DPO hanya dapat melihat data
            presensi.
          </p>

        </div>
      )}

      <div className="card">

        <h2 className="text-xl font-bold mb-6">
          Daftar Peserta ({agenda.absensiAnggota.length})
        </h2>

        {agenda.absensiAnggota.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Belum ada peserta yang melakukan
            presensi.
          </p>
        ) : (
          <div className="space-y-4">

            {agenda.absensiAnggota.map(
              (item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                >

                  <div className="flex justify-between gap-4">

                    <div className="flex-1">

                      <h3 className="font-semibold">
                        {item.user.name}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {item.user.role}
                      </p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "HADIR"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.status}
                        </span>

                        <span className="text-xs text-slate-500">
                          {new Date(
                            item.createdAt
                          ).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>

                      </div>

                      {item.keterangan && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {item.keterangan}
                        </p>
                      )}

                      {item.alasanIzin && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          Alasan:{" "}
                          {item.alasanIzin}
                        </p>
                      )}

                    </div>

                    {item.fotoUrl && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.fotoUrl}
                          alt={`Foto ${item.user.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* DOKUMENTASI KEGIATAN */}

      <div className="card">

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FiImage />
          Dokumentasi Kegiatan
        </h2>

        {agenda.presensiFoto.length === 0 ? (
          <div className="border border-dashed rounded-xl py-10 text-center text-slate-500">
            Belum ada dokumentasi kegiatan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {agenda.presensiFoto.map(
              (foto) => (
                <div
                  key={foto.id}
                  className="relative aspect-video rounded-xl overflow-hidden group"
                >

                  <Image
                    src={foto.fotoUrl}
                    alt="Dokumentasi"
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />

                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[11px] text-white">

                    {new Date(
                      foto.createdAt
                    ).toLocaleString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}