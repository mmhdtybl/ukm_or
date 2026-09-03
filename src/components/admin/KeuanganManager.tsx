"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggal, formatUang } from "@/lib/utils";
import ExportExcelButton from "./ExportExcelButton";
import { FiCheck, FiX, FiTrash2, FiSave } from "react-icons/fi";
import { CABOR_OPTIONS } from "@/lib/divisi";

const emptyForm = { jenis: "MASUK", kategori: "", jumlah: "", keterangan: "" };

function namaDari(k: any) {
  if (k?.anggota) return `${k.anggota.nama} (${k.anggota.nim})`;
  if (k?.pengurus) return `${k.pengurus.nama} (Pengurus)`;
  return k?.dicatatOleh?.name || "";
}

function divisiDari(k: any): string {
  if (k?.anggota?.divisi) return k.anggota.divisi;
  if (k?.pengurus?.divisi) return k.pengurus.divisi;
  return "";
}

export default function KeuanganManager({
  initialData, saldo, totalMasuk, totalKeluar, tujuan,
}: { initialData: any[]; saldo: number; totalMasuk: number; totalKeluar: number; tujuan: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("SEMUA");
  const [divisiFilter, setDivisiFilter] = useState("SEMUA");
  const [tujuanInput, setTujuanInput] = useState(tujuan || "");
  const [savingTujuan, setSavingTujuan] = useState(false);

  async function saveTujuan(e: React.FormEvent) {
    e.preventDefault();
    setSavingTujuan(true);
    await fetch("/api/keuangan/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tujuan: tujuanInput }),
    });
    setSavingTujuan(false);
    router.refresh();
  }

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

  const filtered = initialData.filter((k) => {
    if (filter !== "SEMUA" && k.status !== filter) return false;
    if (divisiFilter !== "SEMUA") {
      const d = divisiDari(k);
      if (divisiFilter === "TANPA_DIVISI") return !d;
      return d === divisiFilter;
    }
    return true;
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center"><div className="text-xl font-bold text-primary dark:text-white">{formatUang(saldo)}</div><div className="text-xs text-slate-500">Saldo Kas</div></div>
        <div className="card text-center"><div className="text-xl font-bold text-green-600">{formatUang(totalMasuk)}</div><div className="text-xs text-slate-500">Total Masuk</div></div>
        <div className="card text-center"><div className="text-xl font-bold text-red-500">{formatUang(totalKeluar)}</div><div className="text-xs text-slate-500">Total Keluar</div></div>
      </div>

      <form onSubmit={saveTujuan} className="card mb-6 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Tujuan Transfer Kas (untuk metode Transfer)</label>
          <input
            className="input"
            value={tujuanInput}
            onChange={(e) => setTujuanInput(e.target.value)}
            placeholder="contoh: BCA 1234567890 a.n. UKM Olahraga"
          />
          <p className="text-xs text-slate-400 mt-1">Nomer rekening bank atau nomer telepon yang ditampilkan saat anggota memilih bayar via Transfer.</p>
        </div>
        <button disabled={savingTujuan} className="btn-primary inline-flex items-center gap-2 disabled:opacity-40">
          <FiSave size={14} /> {savingTujuan ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="input !w-auto !py-1.5 text-sm"
            >
              <option value="SEMUA">Semua Divisi</option>
              {CABOR_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="TANPA_DIVISI">Tanpa Divisi</option>
            </select>

            <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {["SEMUA", "PENDING", "DIVERIFIKASI", "DITOLAK"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`badge ${filter === f ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>{f}</button>
            ))}

            <span className="flex-1" />

            <ExportExcelButton
              filename="data-keuangan.xlsx"
              headers={["Tanggal", "Divisi", "Kategori", "Dari", "Metode", "Jenis", "Jumlah", "Status"]}
              rows={filtered.map((k) => [
                formatTanggal(k.tanggal),
                divisiDari(k) || "-",
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
              <thead><tr><th>Tanggal</th><th>Divisi</th><th>Kategori</th><th>Dari</th><th>Metode</th><th>Jenis</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {filtered.map((k) => (
                  <tr key={k.id}>
                    <td>{formatTanggal(k.tanggal)}</td>
                    <td>{divisiDari(k) ? <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{divisiDari(k)}</span> : <span className="text-slate-400">-</span>}</td>
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
                {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-slate-400 py-6">Tidak ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
