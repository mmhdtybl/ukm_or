"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import DataTableActions from "./DataTableActions";
import ExportCsvButton from "./ExportCsvButton";

const emptyForm = { judul: "", tingkat: "Kampus", peraih: "", penyelenggara: "", tahun: new Date().getFullYear(), gambar: "", keterangan: "" };

const CSV_HEADERS_PRESTASI = ["Judul", "Tingkat", "Peraih", "Penyelenggara", "Tahun"];

export default function PrestasiManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/prestasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Tambah Prestasi</h3>
        <div><label className="label">Judul Prestasi</label><input required className="input" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
        <div>
          <label className="label">Tingkat</label>
          <select className="input" value={form.tingkat} onChange={(e) => setForm({ ...form, tingkat: e.target.value })}>
            <option>Kampus</option><option>Kota</option><option>Provinsi</option><option>Nasional</option><option>Internasional</option>
          </select>
        </div>
        <div><label className="label">Diraih Oleh</label><input required className="input" value={form.peraih} onChange={(e) => setForm({ ...form, peraih: e.target.value })} /></div>
        <div><label className="label">Penyelenggara</label><input className="input" value={form.penyelenggara} onChange={(e) => setForm({ ...form, penyelenggara: e.target.value })} /></div>
        <div><label className="label">Tahun</label><input type="number" required className="input" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })} /></div>
        <ImageUploader value={form.gambar} onChange={(url) => setForm({ ...form, gambar: url })} />
        <div><label className="label">Keterangan</label><textarea rows={2} className="input" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Menyimpan..." : "Tambah Prestasi"}</button>
      </form>

      <div className="md:col-span-2 card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Data Prestasi</h3>
          <ExportCsvButton
            filename="data-prestasi.csv"
            headers={CSV_HEADERS_PRESTASI}
            rows={initialData.map((p) => [p.judul || "", p.tingkat || "", p.peraih || "", p.penyelenggara || "", p.tahun ?? ""])}
          />
        </div>
        <table className="table-admin">
          <thead><tr><th>Judul</th><th>Tingkat</th><th>Peraih</th><th>Tahun</th><th>Aksi</th></tr></thead>
          <tbody>
            {initialData.map((p) => (
              <tr key={p.id}>
                <td>{p.judul}</td><td>{p.tingkat}</td><td>{p.peraih}</td><td>{p.tahun}</td>
                <td><DataTableActions deleteUrl={`/api/prestasi/${p.id}`} /></td>
              </tr>
            ))}
            {initialData.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-6">Belum ada data prestasi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
