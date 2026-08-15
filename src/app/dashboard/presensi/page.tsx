import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getKapabilitas } from "@/lib/permissions";
import { formatTanggal } from "@/lib/utils";
import {
  FiCamera,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";

export const metadata = {
  title: "Presensi Kegiatan",
};

export default async function PresensiListPage() {
  const kap = await getKapabilitas();

  if (!kap?.canUploadPresensi) {
    redirect("/dashboard");
  }

  const agendaList = await prisma.agenda.findMany({
    orderBy: {
      tanggalMulai: "desc",
    },
    take: 20,

    // Ambil foto presensi
    include: {
      presensiFoto: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <span className="section-eyebrow">
          Dokumentasi Kegiatan
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mt-1">
          Presensi Kegiatan
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Pilih kegiatan untuk mengambil foto presensi.
        </p>
      </div>

      {/* DAFTAR KEGIATAN */}
      <div className="space-y-6">

        {agendaList.map((agenda) => (

          <div
            key={agenda.id}
            className="card"
          >

            {/* INFO KEGIATAN */}
            <div className="flex items-center justify-between gap-4 mb-5">

              <div className="flex items-center gap-4 min-w-0">

                <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 dark:bg-white/10 grid place-items-center text-primary dark:text-accent">
                  <FiCalendar size={22} />
                </div>

                <div className="min-w-0">

                  <h2 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                    {agenda.judul}
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    {formatTanggal(agenda.tanggalMulai)}
                    {" · "}
                    {agenda.lokasi}
                  </p>

                </div>

              </div>

              {agenda.presensiFoto.length === 0 ? (
              <Link
                href={`/dashboard/presensi/${agenda.id}`}
                className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2 shrink-0"
              >
                <FiCamera size={16} />

                <span className="hidden sm:inline">
                  Ambil Foto
                </span>

                <FiChevronRight size={16} />
              </Link>
              ) : (
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                  Presensi sudah diambil
                </span>
              )}

            </div>


            {/* FOTO PRESENSI */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Dokumentasi Presensi
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {agenda.presensiFoto.length} foto tersimpan
                  </p>
                </div>

              </div>


              {agenda.presensiFoto.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-8 text-center">

                  <FiCamera
                    size={28}
                    className="mx-auto mb-2 text-slate-300"
                  />

                  <p className="text-sm text-slate-400">
                    Belum ada foto presensi.
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Klik "Ambil Foto" untuk menambahkan dokumentasi.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

                  {agenda.presensiFoto.map((foto) => (

                    <div
                      key={foto.id}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5"
                    >

                      <img
                        src={foto.fotoUrl}
                        alt={`Dokumentasi ${agenda.judul}`}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* TANGGAL */}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-3 py-2">

                        <p className="text-xs text-white">
                          {new Date(
                            foto.createdAt
                          ).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        ))}


        {/* TIDAK ADA KEGIATAN */}
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