"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggal, formatUang } from "@/lib/utils";
import ExportExcelButton from "./ExportExcelButton";
import { FiTrash2 } from "react-icons/fi";

const emptyForm = { jenis: "MASUK", kategori: "", jumlah: "", keterangan: "", tipe: "UMUM" };

function namaDari(k: any) {
  if (k?.anggota) return `${k.anggota.nama} (${k.anggota.nim})`;
  if (k?.pengurus) return `${k.pengurus.nama} (Pengurus)`;
  return k?.dicatatOleh?.name || "";
}

export default function KeuanganManager({
  initialData, saldo, totalMasuk, totalKeluar,
}: { initialData: any[]; saldo: number; totalMasuk: number; totalKeluar: number }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setLoading(false);
    router.refresh();
  }

  async function hapus(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/keuangan/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center"><div className="text-xl font-bold text-primary dark:text-white">{formatUang(saldo)}</div><div className="text-xs text-slate-500">Saldo</div></div>
        <div className="card text-center"><div className="text-xl font-bold text-green-600">{formatUang(totalMasuk)}</div><div className="text-xs text-slate-500">Uang Masuk</div></div>
        <div className="card text-center"><div className="text-xl font-bold text-red-500">{formatUang(totalKeluar)}</div><div className="text-xs text-slate-500">Uang Keluar</div></div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Catat Transaksi</h3>
        <div>
          <label className="label">Jenis</label>
          <select className="input" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
            <option value="MASUK">Pemasukan</option>
            <option value="KELUAR">Pengeluaran</option>
          </select>
        </div>
        <div>
          <label className="label">Sumber</label>
          <select className="input" value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
            <option value="UMUM">Pemasukan Lain</option>
            <option value="KAS">Kas</option>
          </select>
        </div>
        <div><label className="label">Kategori</label><input required className="input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="Sponsor, Perlengkapan, Konsumsi, dll" /></div>
        <div><label className="label">Jumlah (Rp)</label><input type="number" required className="input" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} /></div>
        <div><label className="label">Keterangan</label><textarea rows={2} className="input" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>

      <div className="md:col-span-2">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="flex-1" />
          <ExportExcelButton
            filename="data-keuangan.xlsx"
            headers={["Tanggal", "Sumber", "Kategori", "Dari", "Metode", "Jenis", "Jumlah", "Status"]}
            rows={initialData.map((k) => [
              formatTanggal(k.tanggal),
              k.tipe === "KAS" ? "Kas" : "Pemasukan Lain",
              k.kategori || "",
              namaDari(k),
              k.metode === "TRANSFER" ? "Transfer" : "Offline",
              k.jenis || "",
              k.jumlah ?? "",
              k.status || "",
            ])}
          />
        </div>
        <div className="card overflow-x-auto">
          <table className="table-admin">
            <thead><tr><th>Tanggal</th><th>Sumber</th><th>Kategori</th><th>Dari</th><th>Metode</th><th>Jenis</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {initialData.map((k) => (
                <tr key={k.id}>
                  <td>{formatTanggal(k.tanggal)}</td>
                  <td>{k.tipe === "KAS" ? <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Kas</span> : <span className="badge bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Pemasukan Lain</span>}</td>
                  <td>{k.kategori}</td>
                  <td>{k.anggota ? `${k.anggota.nama} (${k.anggota.nim})` : k.pengurus ? `${k.pengurus.nama} (Pengurus)` : k.dicatatOleh?.name || "-"}</td>
                  <td><span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{k.metode === "TRANSFER" ? "Transfer" : "Offline"}</span></td>
                  <td className={k.jenis === "MASUK" ? "text-green-600" : "text-red-500"}>{k.jenis}</td>
                  <td>{formatUang(k.jumlah)}</td>
                  <td>
                    <span className={`badge ${k.status === "DIVERIFIKASI" ? "bg-green-100 text-green-700" : k.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"}`}>
                      {k.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => hapus(k.id)} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500"><FiTrash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {initialData.length === 0 && <tr><td colSpan={9} className="text-center text-slate-400 py-6">Tidak ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}