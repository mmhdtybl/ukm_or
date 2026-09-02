"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";
import DataTableActions from "./DataTableActions";
import ExportCsvButton from "./ExportCsvButton";
import { FiCheck } from "react-icons/fi";
import { DIVISI_OPTIONS } from "@/lib/divisi";

const CSV_HEADERS_BARANG = ["Nama", "Divisi", "Jumlah", "Kondisi"];

function rowsBarang(list: any[]) {
  return list.map((b) => [b.nama || "", b.divisi || "", b.jumlah ?? "", b.kondisi || ""]);
}

const DIVISI_OPTIONS_BARANG = ["Umum", ...DIVISI_OPTIONS];
const emptyForm = { id: "", nama: "", divisi: "Umum", jumlah: 1, kondisi: "Baik", keterangan: "" };

export default function BarangManager({ initialBarang, initialKomentar }: { initialBarang: any[]; initialKomentar: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const editing = !!form.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = editing ? `/api/barang/${form.id}` : "/api/barang";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm(emptyForm);
    setLoading(false);
    router.refresh();
  }

  async function tindakLanjuti(id: string) {
    await fetch(`/api/komentar-barang/${id}`, { method: "PATCH" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
          <h3 className="font-semibold">{editing ? "Edit Barang" : "Tambah Barang"}</h3>
          <div><label className="label">Nama Barang</label><input required className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="contoh: Bola Voli Mikasa" /></div>
          <div>
            <label className="label">Divisi/Pemilik</label>
            <select className="input" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
              {DIVISI_OPTIONS_BARANG.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div><label className="label">Jumlah</label><input type="number" required className="input" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })} /></div>
          <div>
            <label className="label">Kondisi</label>
            <select className="input" value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })}>
              <option value="Baik">Baik</option>
              <option value="Rusak">Rusak</option>
            </select>
          </div>
          <div><label className="label">Keterangan</label><textarea rows={2} className="input" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></div>
          <div className="flex gap-2">
            <button disabled={loading} className="btn-primary flex-1">{loading ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}</button>
            {editing && <button type="button" onClick={() => setForm(emptyForm)} className="btn-outline flex-1">Batal</button>}
          </div>
        </form>

        <div className="md:col-span-2 card overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Data Barang</h3>
            <ExportCsvButton
              filename="data-barang.csv"
              headers={CSV_HEADERS_BARANG}
              rows={rowsBarang(initialBarang)}
            />
          </div>
          <table className="table-admin">
            <thead><tr><th>Nama</th><th>Divisi</th><th>Jumlah</th><th>Kondisi</th><th>Aksi</th></tr></thead>
            <tbody>
              {initialBarang.map((b) => (
                <tr key={b.id}>
                  <td>{b.nama}</td><td>{b.divisi}</td><td>{b.jumlah}</td>
                  <td><span className={`badge ${b.kondisi === "Baik" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{b.kondisi}</span></td>
                  <td className="flex gap-2">
                    <button onClick={() => setForm(b)} className="text-xs text-blue-600 font-semibold">Edit</button>
                    <DataTableActions deleteUrl={`/api/barang/${b.id}`} />
                  </td>
                </tr>
              ))}
              {initialBarang.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-6">Belum ada data barang.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Request & Laporan Kerusakan dari Anggota</h3>
        <div className="space-y-3">
          {initialKomentar.map((k) => (
            <div key={k.id} className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${k.jenis === "REQUEST" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-600"}`}>
                    {k.jenis === "REQUEST" ? "Request Barang" : "Lapor Rusak"}
                  </span>
                  {k.barang && <span className="text-xs text-slate-400">{k.barang.nama}</span>}
                </div>
                <p className="text-sm">{k.pesan}</p>
                <p className="text-xs text-slate-400 mt-1">{k.anggota.nama} ({k.anggota.nim}) · {formatTanggalWaktu(k.createdAt)}</p>
              </div>
              {k.status === "BARU" ? (
                <button onClick={() => tindakLanjuti(k.id)} className="btn-outline !py-1.5 !px-3 text-xs shrink-0"><FiCheck /> Tandai Ditindak</button>
              ) : (
                <span className="badge bg-green-100 text-green-700 shrink-0">Sudah Ditindak</span>
              )}
            </div>
          ))}
          {initialKomentar.length === 0 && <p className="text-slate-400 text-sm text-center py-6">Belum ada laporan/permintaan dari anggota.</p>}
        </div>
      </div>
    </div>
  );
}
