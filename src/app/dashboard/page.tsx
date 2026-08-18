import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  FiUsers,
  FiFileText,
  FiCalendar,
  FiAward,
  FiUserPlus,
  FiMail,
  FiCamera,
} from "react-icons/fi";
import Link from "next/link";
import { formatTanggal } from "@/lib/utils";

export const metadata = {
  title: "Statistik Dashboard",
};

export default async function DashboardHomePage() {
  // ==========================================
  // SESSION USER
  // ==========================================
  const session = await auth();

  const namaPengguna = session?.user?.name || "Pengguna";

  // ==========================================
  // SAPAAN BERDASARKAN WAKTU
  // ==========================================
  const jam = new Date().getHours();

  let sapaan = "Selamat malam";

  if (jam >= 5 && jam < 11) {
    sapaan = "Selamat pagi";
  } else if (jam >= 11 && jam < 15) {
    sapaan = "Selamat siang";
  } else if (jam >= 15 && jam < 18) {
    sapaan = "Selamat sore";
  }

  // ==========================================
  // DATA DASHBOARD
  // ==========================================
  const [
    jumlahAnggota,
    jumlahPengurus,
    jumlahBerita,
    jumlahAgenda,
    jumlahPrestasi,
    pendaftaranPending,
    pesanBaru,
    agendaTerbaru,
    pendaftaranTerbaru,
    agendaBerlangsung,
  ] = await Promise.all([
    // Total anggota aktif
    prisma.anggota.count({
      where: {
        status: "Aktif",
      },
    }),

    // Total pengurus aktif
    prisma.pengurus.count({
      where: {
        isActive: true,
      },
    }),

    // Total berita
    prisma.berita.count(),

    // Total agenda
    prisma.agenda.count(),

    // Total prestasi
    prisma.prestasi.count(),

    // Pendaftaran yang masih pending
    prisma.pendaftaran.count({
      where: {
        status: "PENDING",
      },
    }),

    // Laporan yang belum dibaca
    prisma.kontak.count({
      where: {
        isRead: false,
      },
    }),

    // 5 agenda terbaru
    prisma.agenda.findMany({
      orderBy: {
        tanggalMulai: "desc",
      },
      take: 5,
    }),

    // 5 pendaftaran pending terbaru
    prisma.pendaftaran.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    // Agenda yang sedang berlangsung
    prisma.agenda.findMany({
      where: {
        status: "BERLANGSUNG",
      },
      orderBy: {
        tanggalMulai: "asc",
      },
      include: {
        presensiFoto: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            diunggahOleh: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // ==========================================
  // STATISTIK
  // ==========================================
  const stats = [
    {
      label: "Total Anggota",
      value: jumlahAnggota,
      icon: FiUsers,
      color: "bg-blue-500",
      href: "/dashboard/anggota",
    },
    {
      label: "Total Pengurus",
      value: jumlahPengurus,
      icon: FiUserPlus,
      color: "bg-cyan-500",
      href: "/dashboard/pengurus",
    },
    {
      label: "Total Berita",
      value: jumlahBerita,
      icon: FiFileText,
      color: "bg-emerald-500",
      href: "/dashboard/berita",
    },
    {
      label: "Total Agenda",
      value: jumlahAgenda,
      icon: FiCalendar,
      color: "bg-accent",
      href: "/dashboard/agenda",
    },
    {
      label: "Total Prestasi",
      value: jumlahPrestasi,
      icon: FiAward,
      color: "bg-purple-500",
      href: "/dashboard/prestasi",
    },
    {
      label: "Pendaftaran Menunggu",
      value: pendaftaranPending,
      icon: FiUserPlus,
      color: "bg-orange-500",
      href: "/dashboard/pendaftaran",
    },
    {
      label: "Laporan Baru",
      value: pesanBaru,
      icon: FiMail,
      color: "bg-rose-500",
      href: "/dashboard/kontak",
    },
  ];

  return (
    <div>
      {/* ==========================================
          SAPAAN
      ========================================== */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary dark:text-white">
          {sapaan}, {namaPengguna}! 👋
        </h1>

        <p className="text-slate-500 mt-1">
          Selamat datang kembali di Dashboard UKM Olahraga.
        </p>
      </div>

      {/* ==========================================
          JUDUL STATISTIK
      ========================================== */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-primary dark:text-white">
          Dashboard Statistik
        </h2>

        <p className="text-sm text-slate-500">
          Ringkasan aktivitas UKM secara keseluruhan.
        </p>
      </div>

      {/* ==========================================
          STATISTIK CARDS
      ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <Link
              key={s.label}
              href={s.href}
              className="card flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${s.color} text-white shrink-0`}
              >
                <Icon size={20} />
              </div>

              <div className="min-w-0">
                <div className="text-2xl font-bold">
                  {s.value}
                </div>

                <div className="text-xs text-slate-500">
                  {s.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ==========================================
          AGENDA TERBARU + PENDAFTARAN
      ========================================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AGENDA TERBARU */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Agenda Terbaru
            </h2>

            <Link
              href="/dashboard/agenda"
              className="text-xs text-primary dark:text-accent font-semibold"
            >
              Lihat semua →
            </Link>
          </div>

          <ul className="space-y-3">
            {agendaTerbaru.map((a) => (
              <li
                key={a.id}
                className="flex justify-between gap-4 text-sm border-b border-slate-100 dark:border-slate-800 pb-2"
              >
                <span className="truncate">
                  {a.judul}
                </span>

                <span className="text-slate-400 whitespace-nowrap">
                  {formatTanggal(a.tanggalMulai)}
                </span>
              </li>
            ))}

            {agendaTerbaru.length === 0 && (
              <p className="text-slate-400 text-sm">
                Belum ada agenda.
              </p>
            )}
          </ul>
        </div>

        {/* PENDAFTARAN MENUNGGU */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Pendaftaran Menunggu
            </h2>

            <Link
              href="/dashboard/pendaftaran"
              className="text-xs text-primary dark:text-accent font-semibold"
            >
              Lihat semua →
            </Link>
          </div>

          <ul className="space-y-3">
            {pendaftaranTerbaru.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 text-sm border-b border-slate-100 dark:border-slate-800 pb-2"
              >
                <span className="truncate">
                  {p.nama}{" "}
                  <span className="text-slate-400">
                    ({p.nim})
                  </span>
                </span>

                <span className="badge bg-orange-100 text-orange-600 shrink-0">
                  Pending
                </span>
              </li>
            ))}

            {pendaftaranTerbaru.length === 0 && (
              <p className="text-slate-400 text-sm">
                Tidak ada pendaftaran menunggu.
              </p>
            )}
          </ul>
        </div>
      </div>

      {/* ==========================================
          PRESENSI FOTO
      ========================================== */}
      <div className="card mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-accent">
            <FiCamera size={19} />
          </div>

          <div>
            <h2 className="font-semibold">
              Pengunggah Foto Presensi
            </h2>

            <p className="text-xs text-slate-500">
              Agenda yang sedang berlangsung.
            </p>
          </div>
        </div>

        {agendaBerlangsung.length === 0 ? (
          <p className="text-sm text-slate-400">
            Tidak ada agenda yang sedang berlangsung.
          </p>
        ) : (
          <div className="space-y-5">
            {agendaBerlangsung.map((agenda) => (
              <div
                key={agenda.id}
                className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
              >
                {/* HEADER AGENDA */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {agenda.judul}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {formatTanggal(agenda.tanggalMulai)}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/presensi/${agenda.id}`}
                    className="text-xs font-semibold text-primary dark:text-accent whitespace-nowrap"
                  >
                    Lihat presensi →
                  </Link>
                </div>

                {/* FOTO PRESENSI */}
                {agenda.presensiFoto.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Belum ada foto presensi yang diunggah.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {agenda.presensiFoto.map((foto) => (
                      <li
                        key={foto.id}
                        className="flex items-center justify-between gap-3 text-sm border-t border-slate-100 pt-2 dark:border-slate-800"
                      >
                        <span className="font-medium">
                          {foto.diunggahOleh?.name ||
                            "Pengguna tidak diketahui"}
                        </span>

                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {foto.createdAt.toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
