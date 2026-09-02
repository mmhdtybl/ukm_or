import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTanggal } from "@/lib/utils";
import { FiPlus } from "react-icons/fi";
import { getKapabilitas } from "@/lib/permissions";
import DataTableActions from "@/components/admin/DataTableActions";
import ExportExcelButton from "@/components/admin/ExportExcelButton";

export const metadata = { title: "Kelola Berita" };

export default async function KelolaBeritaPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageBerita) redirect("/dashboard");

  const berita = await prisma.berita.findMany({ include: { kategori: true }, orderBy: { createdAt: "desc" } });

  const csvRows = berita.map((b) => [
    b.judul,
    b.kategori?.nama || "-",
    b.isPublished ? "Terbit" : "Draft",
    b.dilihat,
    formatTanggal(b.createdAt),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Kelola Berita</h1>
        <div className="flex items-center gap-2">
          <ExportExcelButton filename="data-berita.xlsx" headers={["Judul", "Kategori", "Status", "Dilihat", "Tanggal"]} rows={csvRows} />
          <Link href="/dashboard/berita/baru" className="btn-primary !py-2 !px-4 text-sm"><FiPlus /> Tambah Berita</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead>
            <tr>
              <th>Judul</th><th>Kategori</th><th>Status</th><th>Dilihat</th><th>Tanggal</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {berita.map((b) => (
              <tr key={b.id}>
                <td className="font-medium max-w-xs truncate">{b.judul}</td>
                <td>{b.kategori?.nama || "-"}</td>
                <td>
                  <span className={`badge ${b.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {b.isPublished ? "Terbit" : "Draft"}
                  </span>
                </td>
                <td>{b.dilihat}</td>
                <td>{formatTanggal(b.createdAt)}</td>
                <td><DataTableActions editHref={`/dashboard/berita/${b.id}`} deleteUrl={`/api/berita/${b.id}`} /></td>
              </tr>
            ))}
            {berita.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 py-6">Belum ada berita.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
