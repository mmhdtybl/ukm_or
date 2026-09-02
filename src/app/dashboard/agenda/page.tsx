import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";
import { FiPlus, FiCamera } from "react-icons/fi";
import { getKapabilitas } from "@/lib/permissions";
import DataTableActions from "@/components/admin/DataTableActions";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export const metadata = { title: "Kelola Agenda" };

const statusLabel: Record<string, string> = {
  AKAN_DATANG: "Akan Datang", BERLANGSUNG: "Berlangsung", SELESAI: "Selesai", BATAL: "Dibatalkan",
};

export default async function KelolaAgendaPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageEvent) redirect("/dashboard");

  const agenda = await prisma.agenda.findMany({ orderBy: { tanggalMulai: "desc" } });

  const csvRows = agenda.map((a) => [
    a.judul,
    a.lokasi,
    formatTanggalWaktu(a.tanggalMulai),
    statusLabel[a.status] || a.status,
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Kelola Agenda</h1>
        <div className="flex items-center gap-2">
          <ExportCsvButton filename="data-agenda.csv" headers={["Judul", "Lokasi", "Tanggal", "Status"]} rows={csvRows} />
          <Link href="/dashboard/agenda/baru" className="btn-primary !py-2 !px-4 text-sm"><FiPlus /> Tambah Agenda</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead>
            <tr><th>Judul</th><th>Lokasi</th><th>Tanggal</th><th>Status</th><th>Dokumentasi</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {agenda.map((a) => (
              <tr key={a.id}>
                <td className="font-medium max-w-xs truncate">{a.judul}</td>
                <td>{a.lokasi}</td>
                <td>{formatTanggalWaktu(a.tanggalMulai)}</td>
                <td><span className="badge bg-blue-100 text-blue-700">{statusLabel[a.status]}</span></td>
                <td>
                  <Link href={`/dashboard/presensi/${a.id}`} className="text-primary dark:text-accent flex items-center gap-1 text-xs font-semibold">
                    <FiCamera /> Foto Presensi
                  </Link>
                </td>
                <td><DataTableActions editHref={`/dashboard/agenda/${a.id}`} deleteUrl={`/api/agenda/${a.id}`} /></td>
              </tr>
            ))}
            {agenda.length === 0 && <tr><td colSpan={6} className="text-center text-slate-400 py-6">Belum ada agenda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
