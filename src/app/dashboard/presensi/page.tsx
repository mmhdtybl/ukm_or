import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getKapabilitas } from "@/lib/permissions";
import { formatTanggal } from "@/lib/utils";
import {
  FiCamera,
  FiCalendar,
  FiChevronRight,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiImage,
} from "react-icons/fi";

export const metadata = {
  title: "Dashboard Presensi",
};

export default async function PresensiListPage() {
  const kap = await getKapabilitas();

  const agendaList = await prisma.agenda.findMany({
    orderBy: {
      tanggalMulai: "desc",
    },
    take: 20,
    include: {
      presensiFoto: {
        orderBy: {
          createdAt: "desc",
        },
      },
      absensiAnggota: {
        select: {
          status: true,
          fotoUrl: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto">

      <div className="mb-8">
        <span className="section-eyebrow">
          Monitoring Kehadiran
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mt-1">
          Dashboard Presensi Kegiatan
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Semua pengguna dapat melihat statistik,
          ranking, dan dokumentasi setiap kegiatan.
        </p>
      </div>

      <div className="space-y-6">

        {agendaList.map((agenda) => {
          const hadir =
            agenda.absensiAnggota.filter(
              (a) => a.status === "HADIR"
            ).length;

          const izin =
            agenda.absensiAnggota.filter(
              (a) => a.status === "IZIN"
            ).length;

          const total =
            agenda.absensiAnggota.length;

          const fotoPresensi =
            agenda.absensiAnggota.filter(
              (a) => Boolean(a.fotoUrl)
            );

          return (
            <div
              key={agenda.id}
              className="card"
            >

              <div className="flex items-center justify-between gap-4 mb-5">

                <div className="flex items-center gap-4 min-w-0">

                  <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-white/10 grid place-items-center text-primary dark:text-accent shrink-0">
                    <FiCalendar size={22} />
                  </div>

                  <div className="min-w-0">

                    <h2 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                      {agenda.judul}
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      {formatTanggal(
                        agenda.tanggalMulai
                      )}
                      {" · "}
                      {agenda.lokasi}
                    </p>

                  </div>
                </div>

                <div className="flex gap-2 shrink-0">

                  <Link
                    href={`/akun-saya/absensi/${agenda.id}`}
                    className="btn-outline !px-4 !py-2 text-sm flex items-center gap-2"
                  >
                    Lihat Detail
                    <FiChevronRight size={16} />
                  </Link>

                  {kap?.canUploadPresensi && (
                    <Link
                      href={`/akun-saya/absensi/${agenda.id}`}
                      className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2"
                    >
                      <FiCamera size={16} />

                      <span className="hidden sm:inline">
                        Presensi
                      </span>
                    </Link>
                  )}

                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-800 pt-5 mb-6">

                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 text-center">
                  <FiUsers
                    className="mx-auto text-primary mb-2"
                    size={22}
                  />

                  <p className="text-2xl font-bold">
                    {total}
                  </p>

                  <p className="text-xs text-slate-500">
                    Total
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 dark:bg-green-900/10 p-4 text-center">
                  <FiCheckCircle
                    className="mx-auto text-green-600 mb-2"
                    size={22}
                  />

                  <p className="text-2xl font-bold text-green-600">
                    {hadir}
                  </p>

                  <p className="text-xs text-slate-500">
                    Hadir
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 p-4 text-center">
                  <FiClock
                    className="mx-auto text-blue-600 mb-2"
                    size={22}
                  />

                  <p className="text-2xl font-bold text-blue-600">
                    {izin}
                  </p>

                  <p className="text-xs text-slate-500">
                    Izin
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 p-4 text-center">
                  <FiImage
                    className="mx-auto text-amber-600 mb-2"
                    size={22}
                  />

                  <p className="text-2xl font-bold text-amber-600">
                    {fotoPresensi.length}
                  </p>

                  <p className="text-xs text-slate-500">
                    Foto Presensi
                  </p>
                </div>

              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-5">

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      Foto Presensi Anggota
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {fotoPresensi.length} foto
                      tersimpan
                    </p>
                  </div>

                </div>

                {fotoPresensi.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-8 text-center">

                    <FiCamera
                      size={28}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm text-slate-400">
                      Belum ada foto presensi.
                    </p>

                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

                    {fotoPresensi.map((foto) => (
                      <div
                        key={foto.createdAt.toString() + foto.user.id}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5"
                      >

                        <img
                          src={foto.fotoUrl!}
                          alt={`Foto presensi ${foto.user.name}`}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-3 py-2">

                          <p className="text-xs text-white font-medium">
                            {foto.user.name}
                          </p>

                          <p className="text-[11px] text-white/70">
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
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>
          );
        })}

        {agendaList.length === 0 && (
          <div className="card text-center py-12">

            <FiCalendar
              size={40}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-slate-500 dark:text-slate-400">
              Belum ada kegiatan.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}