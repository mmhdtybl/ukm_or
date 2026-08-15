import { prisma } from "@/lib/prisma";
import { FiUsers, FiFileText, FiCalendar, FiAward, FiUserPlus, FiMail, FiCamera } from "react-icons/fi";
import Link from "next/link";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Statistik Dashboard" };

export default async function DashboardHomePage() {
  const [jumlahAnggota, jumlahBerita, jumlahAgenda, jumlahPrestasi, pendaftaranPending, pesanBaru, agendaTerbaru, pendaftaranTerbaru, agendaBerlangsung] =
    await Promise.all([
      prisma.anggota.count(),
      prisma.berita.count(),
      prisma.agenda.count(),
      prisma.prestasi.count(),
      prisma.pendaftaran.count({ where: { status: "PENDING" } }),
      prisma.kontak.count({ where: { isRead: false } }),
      prisma.agenda.findMany({ orderBy: { tanggalMulai: "desc" }, take: 5 }),
      prisma.pendaftaran.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.agenda.findMany({
        where: { status: "BERLANGSUNG" },
        orderBy: { tanggalMulai: "asc" },
        include: {
          presensiFoto: {
            orderBy: { createdAt: "desc" },
            include: { diunggahOleh: { select: { name: true } } },
          },
        },
      }),
    ]);

  const stats = [
    { label: "Total Anggota", value: jumlahAnggota, icon: FiUsers, color: "bg-blue-500", href: "/dashboard/anggota" },
    { label: "Total Berita", value: jumlahBerita, icon: FiFileText, color: "bg-emerald-500", href: "/dashboard/berita" },
    { label: "Total Agenda", value: jumlahAgenda, icon: FiCalendar, color: "bg-accent", href: "/dashboard/agenda" },
    { label: "Total Prestasi", value: jumlahPrestasi, icon: FiAward, color: "bg-purple-500", href: "/dashboard/prestasi" },
    { label: "Pendaftaran Menunggu", value: pendaftaranPending, icon: FiUserPlus, color: "bg-orange-500", href: "/dashboard/pendaftaran" },
    { label: "Pesan Belum Dibaca", value: pesanBaru, icon: FiMail, color: "bg-rose-500", href: "/dashboard/kontak" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Dashboard Statistik</h1>
      <p className="text-slate-500 mb-8">Ringkasan aktivitas UKM secara keseluruhan.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40">
            <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.color} text-white shrink-0`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Agenda Terbaru</h2>
          <ul className="space-y-3">
            {agendaTerbaru.map((a) => (
              <li key={a.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>{a.judul}</span>
                <span className="text-slate-400">{formatTanggal(a.tanggalMulai)}</span>
              </li>
            ))}
            {agendaTerbaru.length === 0 && <p className="text-slate-400 text-sm">Belum ada agenda.</p>}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Pendaftaran Menunggu</h2>
            <Link href="/dashboard/pendaftaran" className="text-xs text-primary dark:text-accent font-semibold">Lihat semua →</Link>
          </div>
          <ul className="space-y-3">
            {pendaftaranTerbaru.map((p) => (
              <li key={p.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>{p.nama} <span className="text-slate-400">({p.nim})</span></span>
                <span className="badge bg-orange-100 text-orange-600">Pending</span>
              </li>
            ))}
            {pendaftaranTerbaru.length === 0 && <p className="text-slate-400 text-sm">Tidak ada pendaftaran menunggu.</p>}
          </ul>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-accent">
            <FiCamera size={19} />
          </div>
          <div>
            <h2 className="font-semibold">Pengunggah Foto Presensi</h2>
            <p className="text-xs text-slate-500">Agenda yang sedang berlangsung.</p>
          </div>
        </div>

        {agendaBerlangsung.length === 0 ? (
          <p className="text-sm text-slate-400">Tidak ada agenda yang sedang berlangsung.</p>
        ) : (
          <div className="space-y-5">
            {agendaBerlangsung.map((agenda) => (
              <div key={agenda.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{agenda.judul}</h3>
                    <p className="text-xs text-slate-500">{formatTanggal(agenda.tanggalMulai)}</p>
                  </div>
                  <Link href={`/dashboard/presensi/${agenda.id}`} className="text-xs font-semibold text-primary dark:text-accent whitespace-nowrap">
                    Lihat presensi →
                  </Link>
                </div>

                {agenda.presensiFoto.length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada foto presensi yang diunggah.</p>
                ) : (
                  <ul className="space-y-2">
                    {agenda.presensiFoto.map((foto) => (
                      <li key={foto.id} className="flex items-center justify-between gap-3 text-sm border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span className="font-medium">{foto.diunggahOleh?.name || "Pengguna tidak diketahui"}</span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {foto.createdAt.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
