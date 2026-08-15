"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

const emptyForm = {
  namaUKM: "", logo: "", deskripsi: "", visi: "", misi: "", sejarah: "",
  alamat: "", email: "", telepon: "", instagram: "", facebook: "", youtube: "", tiktok: "", waGroupLink: "",
};

export default function ProfilUKMForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [form, setForm] = useState(initialData || emptyForm);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/profil-ukm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="card space-y-4">
        <h3 className="font-semibold">Informasi Umum</h3>
        <div><label className="label">Nama UKM</label><input required className="input" value={form.namaUKM} onChange={(e) => setForm({ ...form, namaUKM: e.target.value })} /></div>
        <ImageUploader value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} label="Logo UKM" />
        <div><label className="label">Deskripsi</label><textarea required rows={4} className="input" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
        <div><label className="label">Sejarah</label><textarea rows={4} className="input" value={form.sejarah} onChange={(e) => setForm({ ...form, sejarah: e.target.value })} /></div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold">Visi & Misi</h3>
        <div><label className="label">Visi</label><textarea required rows={2} className="input" value={form.visi} onChange={(e) => setForm({ ...form, visi: e.target.value })} /></div>
        <div><label className="label">Misi (satu baris per poin)</label><textarea required rows={4} className="input" value={form.misi} onChange={(e) => setForm({ ...form, misi: e.target.value })} /></div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold">Kontak & Sosial Media</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Alamat</label><input className="input" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Telepon</label><input className="input" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} /></div>
          <div><label className="label">Instagram</label><input className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
          <div><label className="label">Facebook</label><input className="input" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
          <div><label className="label">YouTube</label><input className="input" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} /></div>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold">Grup WhatsApp</h3>
        <div>
          <label className="label">Link Grup WhatsApp Resmi</label>
          <input className="input" value={form.waGroupLink} onChange={(e) => setForm({ ...form, waGroupLink: e.target.value })} placeholder="https://chat.whatsapp.com/xxxxxxxx" />
          <p className="text-xs text-slate-400 mt-1">Link ini otomatis dikirim ke pendaftar yang diterima, sebagai langkah awal sebelum akun login dibuatkan.</p>
        </div>
      </div>

      <button disabled={loading} className="btn-primary">{loading ? "Menyimpan..." : "Simpan Profil UKM"}</button>
      {saved && <p className="text-green-600 text-sm">Perubahan berhasil disimpan.</p>}
    </form>
  );
}
