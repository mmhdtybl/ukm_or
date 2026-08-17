import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { formatTanggalWaktu } from "@/lib/utils";
import { FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";

export const metadata = { title: "Agenda Kegiatan" };

const statusColor: Record<string, string> = {
  AKAN_DATANG: "bg-blue-100 text-blue-700",
  BERLANGSUNG: "bg-green-100 text-green-700",
  SELESAI: "bg-slate-100 text-slate-500",
  BATAL: "bg-red-100 text-red-600",
};
const statusLabel: Record<string, string> = {
  AKAN_DATANG: "Akan Datang",
  BERLANGSUNG: "Berlangsung",
  SELESAI: "Selesai",
  BATAL: "Dibatalkan",
};

export default async function AgendaPage() {
  const agenda = await prisma.agenda.findMany({ orderBy: { tanggalMulai: "desc" } });
  const mendatang = agenda.filter((a) => a.status !== "SELESAI" && a.status !== "BATAL");
  const lampau = agenda.filter((a) => a.status === "SELESAI" || a.status === "BATAL");

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Kalender Kegiatan</span>
      <h1 className="section-title mb-10">Event UKM Olahraga</h1>

      <h2 className="font-semibold text-xl mb-4 text-primary dark:text-accent">Akan Berlangsung</h2>
      {mendatang.length === 0 ? (
        <p className="text-slate-500 mb-10">Belum ada agenda mendatang.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {mendatang.map((a) => (
            <div key={a.id} id={a.slug} className="card flex gap-4">
              <div className="shrink-0 w-16 text-center">
                <div className="rounded-lg bg-primary text-white py-2">
                  <div className="text-xl font-bold leading-none">{new Date(a.tanggalMulai).getDate()}</div>
                  <div className="text-[10px] uppercase mt-1">
                    {new Date(a.tanggalMulai).toLocaleDateString("id-ID", { month: "short" })}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <span className={`badge ${statusColor[a.status]} mb-2`}>{statusLabel[a.status]}</span>
                <h3 className="font-semibold text-lg mb-1">{a.judul}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{a.deskripsi}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><FiCalendar /> {formatTanggalWaktu(a.tanggalMulai)}</span>
                  <span className="flex items-center gap-1"><FiMapPin /> {a.lokasi}</span>
                  {a.kuota && <span className="flex items-center gap-1"><FiUsers /> Kuota {a.kuota}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-xl mb-4 text-primary dark:text-accent">Riwayat Kegiatan</h2>
      {lampau.length === 0 ? (
        <p className="text-slate-500">Belum ada riwayat kegiatan.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {lampau.map((a) => (
            <div key={a.id} className="card opacity-80">
              <span className={`badge ${statusColor[a.status]} mb-2`}>{statusLabel[a.status]}</span>
              <h3 className="font-medium mb-1">{a.judul}</h3>
              <p className="text-xs text-slate-400">{formatTanggalWaktu(a.tanggalMulai)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
