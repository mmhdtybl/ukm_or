"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

function toLocalInput(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function AgendaForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    judul: initialData?.judul || "",
    deskripsi: initialData?.deskripsi || "",
    lokasi: initialData?.lokasi || "",
    tanggalMulai: toLocalInput(initialData?.tanggalMulai),
    tanggalSelesai: toLocalInput(initialData?.tanggalSelesai),
    gambar: initialData?.gambar || "",
    status: initialData?.status || "AKAN_DATANG",
    kuota: initialData?.kuota || "",
    penyelenggara: initialData?.penyelenggara || "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = initialData ? `/api/agenda/${initialData.id}` : "/api/agenda";
    const method = initialData ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    router.push("/dashboard/agenda");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 card">
      <div>
        <label className="label">Judul Kegiatan</label>
        <input required className="input" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
      </div>
      <ImageUploader value={form.gambar} onChange={(url) => setForm({ ...form, gambar: url })} />
      <div>
        <label className="label">Deskripsi</label>
        <textarea required rows={4} className="input" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Lokasi</label>
          <input required className="input" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
        </div>
        <div>
          <label className="label">Penyelenggara</label>
          <input className="input" value={form.penyelenggara} onChange={(e) => setForm({ ...form, penyelenggara: e.target.value })} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Waktu Mulai</label>
          <input type="datetime-local" required className="input" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} />
        </div>
        <div>
          <label className="label">Waktu Selesai</label>
          <input type="datetime-local" required className="input" value={form.tanggalSelesai} onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Kuota Peserta (opsional)</label>
          <input type="number" className="input" value={form.kuota} onChange={(e) => setForm({ ...form, kuota: e.target.value })} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="AKAN_DATANG">Akan Datang</option>
            <option value="BERLANGSUNG">Berlangsung</option>
            <option value="SELESAI">Selesai</option>
            <option value="BATAL">Dibatalkan</option>
          </select>
        </div>
      </div>
      <button disabled={loading} className="btn-primary">{loading ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat Agenda"}</button>
    </form>
  );
}
