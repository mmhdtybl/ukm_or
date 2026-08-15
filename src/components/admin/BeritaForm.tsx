"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

type Kategori = { id: string; nama: string };

export default function BeritaForm({ kategoriList, initialData }: { kategoriList: Kategori[]; initialData?: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    judul: initialData?.judul || "",
    ringkasan: initialData?.ringkasan || "",
    konten: initialData?.konten || "",
    kategoriId: initialData?.kategoriId || "",
    gambar: initialData?.gambar || "",
    isPublished: initialData?.isPublished || false,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = initialData ? `/api/berita/${initialData.id}` : "/api/berita";
    const method = initialData ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    router.push("/dashboard/berita");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 card">
      <div>
        <label className="label">Judul Berita</label>
        <input required className="input" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
      </div>
      <div>
        <label className="label">Kategori</label>
        <select className="input" value={form.kategoriId} onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}>
          <option value="">Pilih kategori</option>
          {kategoriList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
      </div>
      <ImageUploader value={form.gambar} onChange={(url) => setForm({ ...form, gambar: url })} />
      <div>
        <label className="label">Ringkasan</label>
        <textarea required rows={2} className="input" value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} />
      </div>
      <div>
        <label className="label">Konten Lengkap</label>
        <textarea required rows={10} className="input" value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
        Publikasikan berita ini
      </label>
      <button disabled={loading} className="btn-primary">
        {loading ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Publikasikan Berita"}
      </button>
    </form>
  );
}
