"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggal, formatUang } from "@/lib/utils";
import { FiCheck, FiX, FiTrash2 } from "react-icons/fi";

const emptyForm = { jenis: "MASUK", kategori: "", jumlah: "", keterangan: "" };

export default function KeuanganManager({
  initialData, saldo, totalMasuk, totalKeluar,
}: { initialData: any[]; saldo: number; totalMasuk: number; totalKeluar: number }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("SEMUA");

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

  async function verifikasi(id: string, status: string) {
    await fetch(`/api/keuangan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function hapus(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/keuangan/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const filtered = filter === "SEMUA" ? initialData : initialData.filter((k) => k.status === filter);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center"><div className="text-xl font-bold text-primary dark:text-white">{formatUang(saldo)}</div><div className="text-xs text-slate-500">Saldo Kas</div></div>
        <div className="card text-center"><div className="text-xl font-bold text-green-600">{formatUang(totalMasuk)}</div><div className="text-xs text-slate-500">Total Masuk</div></div>
        <div className="card text-center"><div className="text-xl font-bold text-red-500">{formatUang(totalKeluar)}</div><div className="text-xs text-slate-500">Total Keluar</div></div>
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
          <div><label className="label">Kategori</label><input required className="input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="Sponsor, Perlengkapan, Konsumsi, dll" /></div>
          <div><label className="label">Jumlah (Rp)</label><input type="number" required className="input" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} /></div>
          <div><label className="label">Keterangan</label><textarea rows={2} className="input" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Menyimpan..." : "Simpan"}</button>
        </form>

        <div className="md:col-span-2">
          <div className="flex gap-2 mb-4">
            {["SEMUA", "PENDING", "DIVERIFIKASI", "DITOLAK"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`badge ${filter === f ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>{f}</button>
            ))}
          </div>
          <div className="card overflow-x-auto">
            <table className="table-admin">
              <thead><tr><th>Tanggal</th><th>Kategori</th><th>Dari</th><th>Jenis</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {filtered.map((k) => (
                  <tr key={k.id}>
                    <td>{formatTanggal(k.tanggal)}</td>
                    <td>{k.kategori}</td>
                    <td>{k.anggota ? `${k.anggota.nama} (${k.anggota.nim})` : k.dicatatOleh?.name || "-"}</td>
                    <td className={k.jenis === "MASUK" ? "text-green-600" : "text-red-500"}>{k.jenis}</td>
                    <td>{formatUang(k.jumlah)}</td>
                    <td>
                      <span className={`badge ${k.status === "DIVERIFIKASI" ? "bg-green-100 text-green-700" : k.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="flex gap-1">
                      {k.status === "PENDING" && (
                        <>
                          <button onClick={() => verifikasi(k.id, "DIVERIFIKASI")} className="grid h-7 w-7 place-items-center rounded-lg bg-green-50 text-green-600"><FiCheck size={13} /></button>
                          <button onClick={() => verifikasi(k.id, "DITOLAK")} className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600"><FiX size={13} /></button>
                        </>
                      )}
                      <button onClick={() => hapus(k.id)} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500"><FiTrash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 py-6">Tidak ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
