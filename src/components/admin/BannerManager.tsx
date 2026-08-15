"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import { FiTrash2 } from "react-icons/fi";

const emptyForm = { judul: "", subjudul: "", gambar: "", linkUrl: "", urutan: 0, isActive: true };

export default function BannerManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gambar) return alert("Silakan unggah gambar banner terlebih dahulu");
    setLoading(true);
    await fetch("/api/banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus banner ini?")) return;
    await fetch(`/api/banner/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Tambah Banner</h3>
        <div><label className="label">Judul</label><input required className="input" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
        <div><label className="label">Sub Judul</label><input className="input" value={form.subjudul} onChange={(e) => setForm({ ...form, subjudul: e.target.value })} /></div>
        <ImageUploader value={form.gambar} onChange={(url) => setForm({ ...form, gambar: url })} />
        <div><label className="label">Link Tujuan (opsional)</label><input className="input" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></div>
        <div><label className="label">Urutan Tampil</label><input type="number" className="input" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} /></div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Menyimpan..." : "Tambah Banner"}</button>
      </form>

      <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
        {initialData.map((b) => (
          <div key={b.id} className="card relative">
            <div className="relative h-32 rounded-lg overflow-hidden mb-3">
              <Image src={b.gambar} alt={b.judul} fill className="object-cover" />
            </div>
            <h4 className="font-semibold">{b.judul}</h4>
            <p className="text-xs text-slate-500 mb-2">{b.subjudul}</p>
            <button onClick={() => handleDelete(b.id)} className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white">
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
        {initialData.length === 0 && <p className="text-slate-400 col-span-full text-center py-10">Belum ada banner.</p>}
      </div>
    </div>
  );
}
