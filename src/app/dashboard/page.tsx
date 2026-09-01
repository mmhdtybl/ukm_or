import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { formatTanggal } from "@/lib/utils";
import { getKapabilitas } from "@/lib/permissions";
import { hitungKasBulanan, getDataUlangTahun } from "@/lib/kas";
import KasNotifCard from "@/components/KasNotifCard";
import BirthdayPanel from "@/components/BirthdayPanel";
import {
  FiUsers,
  FiFileText,
  FiCalendar,
  FiAward,
  FiUserPlus,
  FiMail,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";

export const metadata = {
  title: "Dashboard UKM",
};

export default async function DashboardHomePage() {
  const session = await auth();
  const namaPengguna = session?.user?.name || "Pengguna";

  const jam = new Date().getHours();
  let sapaan = "Selamat malam";

  if (jam >= 5 && jam < 11) sapaan = "Selamat pagi";
  else if (jam >= 11 && jam < 15) sapaan = "Selamat siang";
  else if (jam >= 15 && jam < 18) sapaan = "Selamat sore";

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
    prisma.anggota.count({ where: { status: "Aktif" } }),
    prisma.pengurus.count({ where: { isActive: true } }),
    prisma.berita.count(),
    prisma.agenda.count(),
    prisma.prestasi.count(),
    prisma.pendaftaran.count({ where: { status: "PENDING" } }),
    prisma.kontak.count({ where: { isRead: false } }),
    prisma.agenda.findMany({
      orderBy: { tanggalMulai: "desc" },
      take: 5,
    }),
    prisma.pendaftaran.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.agenda.findMany({
      where: { status: "BERLANGSUNG" },
      include: {
        absensiAnggota: {
          include: {
            user: {
              select: {
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
          take: 4,
        },
      },
    }),
  ]);

  let pengurusKas: null | import("@/lib/kas").StatusKasBulanan = null;
  let namaUser = namaPengguna;
  const kap = await getKapabilitas();
  const userId = (session?.user as any)?.id;
  const dataUlang = await getDataUlangTahun();

  if (userId && kap && !kap.isAdmin && !kap.isDPO) {
    const pengurus = await prisma.pengurus.findUnique({ where: { userId } });
    const anggota = await prisma.anggota.findUnique({ where: { userId } });
    if (pengurus) {
      namaUser = pengurus.nama || namaPengguna;
      pengurusKas = await hitungKasBulanan(null, pengurus.id);
    } else if (anggota) {
      namaUser = anggota.nama || namaPengguna;
      pengurusKas = await hitungKasBulanan(anggota.id, null);
    }
  }

  const stats = [
    {
      label: "Total Anggota",
      value: jumlahAnggota,
      icon: FiUsers,
      color: "bg-blue-500",
      href: "/dashboard/anggota",
    },
    {
      label: "Pengurus",
      value: jumlahPengurus,
      icon: FiUserPlus,
      color: "bg-cyan-500",
      href: "/dashboard/pengurus",
    },
    {
      label: "Berita",
      value: jumlahBerita,
      icon: FiFileText,
      color: "bg-emerald-500",
      href: "/dashboard/berita",
    },
    {
      label: "Agenda",
      value: jumlahAgenda,
      icon: FiCalendar,
      color: "bg-yellow-500",
      href: "/dashboard/agenda",
    },
    {
      label: "Prestasi",
      value: jumlahPrestasi,
      icon: FiAward,
      color: "bg-purple-500",
      href: "/dashboard/prestasi",
    },
    {
      label: "Pendaftaran",
      value: pendaftaranPending,
      icon: FiUserPlus,
      color: "bg-orange-500",
      href: "/dashboard/pendaftaran",
    },
    {
      label: "Pesan Baru",
      value: pesanBaru,
      icon: FiMail,
      color: "bg-rose-500",
      href: "/dashboard/kontak",
    },
  ];

  return (
    <div className="space-y-8">

      {/* SAPAAN */}

      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-white">
          {sapaan}, {namaUser}! 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Selamat datang kembali di Dashboard UKM Olahraga.
        </p>
      </div>

      {/* NOTIF KAS & ULANG TAHUN */}

      {pengurusKas && (
        <KasNotifCard
          nama={namaUser}
          status={pengurusKas}
        />
      )}

      <BirthdayPanel orang={dataUlang} />

      {/* STATISTIK */}

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Statistik UKM
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">

          {stats.map((s) => {
            const Icon = s.icon;

            return (
              <Link
                key={s.label}
                href={s.href}
                className="card hover:-translate-y-1 hover:shadow-lg transition"
              >
                <div
                  className={`h-11 w-11 rounded-xl ${s.color} text-white grid place-items-center mb-3`}
                >
                  <Icon size={20} />
                </div>

                <div className="text-2xl font-bold">
                  {s.value}
                </div>

                <p className="text-xs text-slate-500">
                  {s.label}
                </p>
              </Link>
            );
          })}

        </div>
      </div>

      {/* PRESENSI BERLANGSUNG */}

      <div className="card">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="font-bold text-lg flex items-center gap-2">
              <FiCamera className="text-primary" />
              Presensi Kegiatan Berlangsung
            </h2>

            <p className="text-sm text-slate-500">
              Ranking peserta tercepat dan dokumentasi kegiatan.
            </p>

          </div>

          <Link
            href="/dashboard/presensi"
            className="text-primary flex items-center gap-1 text-sm font-semibold"
          >
            Lihat semua
            <FiArrowRight />
          </Link>

        </div>

        {agendaBerlangsung.length === 0 ? (

          <p className="text-slate-500">
            Tidak ada agenda yang sedang berlangsung.
          </p>

        ) : (

          <div className="space-y-8">

            {agendaBerlangsung.map((agenda) => {

              const hadir = agenda.absensiAnggota.filter(
                (a) => a.status === "HADIR"
              ).length;

              const izin = agenda.absensiAnggota.filter(
                (a) => a.status === "IZIN"
              ).length;

              const ranking = agenda.absensiAnggota.filter(
                (a) => a.status === "HADIR"
              );

              return (
                <div
                  key={agenda.id}
                  className="border rounded-2xl p-5 dark:border-slate-800"
                >

                  <div className="flex justify-between items-center mb-5">

                    <div>

                      <h3 className="font-bold text-lg">
                        {agenda.judul}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {formatTanggal(agenda.tanggalMulai)}
                      </p>

                    </div>

                    <Link
                      href={`/akun-saya/absensi/${agenda.id}`}
                      className="btn-outline text-sm"
                    >
                      Detail
                    </Link>

                  </div>

                  {/* Statistik Presensi */}

                  <div className="grid grid-cols-3 gap-3 mb-6">

                    <div className="rounded-xl bg-green-50 dark:bg-green-900/10 p-3 text-center">

                      <FiCheckCircle
                        className="mx-auto text-green-600 mb-2"
                        size={20}
                      />

                      <p className="text-xl font-bold">
                        {hadir}
                      </p>

                      <p className="text-xs text-slate-500">
                        Hadir
                      </p>

                    </div>

                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 p-3 text-center">

                      <FiClock
                        className="mx-auto text-blue-600 mb-2"
                        size={20}
                      />

                      <p className="text-xl font-bold">
                        {izin}
                      </p>

                      <p className="text-xs text-slate-500">
                        Izin
                      </p>

                    </div>

                    <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/10 p-3 text-center">

                      <FiUsers
                        className="mx-auto text-yellow-600 mb-2"
                        size={20}
                      />

                      <p className="text-xl font-bold">
                        {agenda.absensiAnggota.length}
                      </p>

                      <p className="text-xs text-slate-500">
                        Total
                      </p>

                    </div>

                  </div>

                  {/* PODIUM */}

                  <div className="mb-6">

                    <h4 className="font-semibold mb-4 flex items-center gap-2">

                      <FiAward className="text-yellow-500" />

                      Top 3 Datang Paling Awal

                    </h4>

                    {ranking.length === 0 ? (

                      <p className="text-sm text-slate-500">
                        Belum ada peserta yang hadir.
                      </p>

                    ) : (

                      <div className="grid md:grid-cols-3 gap-4">

                        {ranking.slice(0, 3).map((item, index) => {

                          const warna =
                            index === 0
                              ? "from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "from-slate-300 to-slate-500"
                              : "from-orange-400 to-orange-600";

                          const medal =
                            index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : "🥉";

                          return (
                            <div
                              key={item.id}
                              className={`rounded-2xl bg-gradient-to-b ${warna} text-white p-5 text-center`}
                            >

                              <div className="text-4xl mb-3">
                                {medal}
                              </div>

                              <h5 className="font-bold">
                                {item.user.name}
                              </h5>

                              <p className="text-xs opacity-90">
                                {item.user.role}
                              </p>

                              <p className="mt-3 font-semibold">
                                {item.createdAt.toLocaleTimeString(
                                  "id-ID",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>

                            </div>
                          );
                        })}

                      </div>

                    )}

                  </div>

                  {/* GALERI */}

                  <div>

                    <h4 className="font-semibold mb-3">
                      Dokumentasi Terbaru
                    </h4>

                    {agenda.presensiFoto.length === 0 ? (

                      <p className="text-sm text-slate-500">
                        Belum ada dokumentasi.
                      </p>

                    ) : (

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                        {agenda.presensiFoto.map((foto) => (

                          <div
                            key={foto.id}
                            className="relative aspect-video rounded-xl overflow-hidden"
                          >

                            <Image
                              src={foto.fotoUrl}
                              alt="Dokumentasi"
                              fill
                              className="object-cover hover:scale-105 transition"
                            />

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* AGENDA & PENDAFTARAN */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="card">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-semibold">
              Agenda Terbaru
            </h2>

            <Link
              href="/dashboard/agenda"
              className="text-primary text-sm font-semibold"
            >
              Lihat semua →
            </Link>

          </div>

          <ul className="space-y-3">

            {agendaTerbaru.map((a) => (

              <li
                key={a.id}
                className="flex justify-between border-b pb-2 text-sm"
              >

                <span className="truncate">
                  {a.judul}
                </span>

                <span className="text-slate-400">
                  {formatTanggal(a.tanggalMulai)}
                </span>

              </li>

            ))}

          </ul>

        </div>

        <div className="card">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-semibold">
              Pendaftaran Menunggu
            </h2>

            <Link
              href="/dashboard/pendaftaran"
              className="text-primary text-sm font-semibold"
            >
              Lihat semua →
            </Link>

          </div>

          <ul className="space-y-3">

            {pendaftaranTerbaru.map((p) => (

              <li
                key={p.id}
                className="flex justify-between border-b pb-2 text-sm"
              >

                <span>
                  {p.nama}
                </span>

                <span className="text-orange-500 font-semibold">
                  Pending
                </span>

              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>
  );
}