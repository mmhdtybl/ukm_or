"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

const emptyForm = { id: "", gambar: "", linkUrl: "", urutan: 0 };

export default function BannerManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const editing = Boolean(form.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gambar) return alert("Silakan unggah gambar banner terlebih dahulu.");
    setLoading(true);
    const res = await fetch(editing ? `/api/banner/${form.id}` : "/api/banner", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.message || "Gagal menyimpan banner.");
    setForm(emptyForm); router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus banner ini?")) return;
    const res = await fetch(`/api/banner/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Gagal menghapus banner.");
    if (form.id === id) setForm(emptyForm);
    router.refresh();
  }

  return <div className="grid md:grid-cols-3 gap-6">
    <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
      <h3 className="font-semibold flex items-center gap-2">{editing ? <FiEdit2 /> : <FiPlus />}{editing ? "Ubah Banner" : "Tambah Banner"}</h3>
      <ImageUploader value={form.gambar} onChange={(gambar) => setForm({ ...form, gambar })} label="Gambar Banner" />
      <div><label className="label">Link Tujuan</label><input className="input" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://... atau /agenda" /><p className="mt-1 text-xs text-slate-400">Pengunjung akan diarahkan ke tautan ini saat banner diklik.</p></div>
      <div><label className="label">Urutan Tampil</label><input type="number" className="input" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} /></div>
      <div className="flex gap-2"><button disabled={loading} className="btn-primary flex-1">{loading ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Banner"}</button>{editing && <button type="button" onClick={() => setForm(emptyForm)} className="btn-outline">Batal</button>}</div>
    </form>
    <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">{initialData.map((b) => <div key={b.id} className="card relative"><div className="relative h-36 rounded-lg overflow-hidden mb-3"><Image src={b.gambar} alt="Banner home" fill className="object-cover" /></div><p className="text-xs text-slate-500 truncate">{b.linkUrl || "Tanpa link"}</p><p className="text-xs text-slate-400 mt-1">Urutan: {b.urutan}</p><div className="absolute top-3 right-3 flex gap-2"><button type="button" onClick={() => setForm({ id: b.id, gambar: b.gambar, linkUrl: b.linkUrl || "", urutan: b.urutan })} className="grid h-8 w-8 place-items-center rounded-full bg-blue-500 text-white"><FiEdit2 size={14} /></button><button type="button" onClick={() => handleDelete(b.id)} className="grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white"><FiTrash2 size={14} /></button></div></div>)}{initialData.length === 0 && <p className="text-slate-400 col-span-full text-center py-10">Belum ada banner.</p>}</div>
  </div>;
}
