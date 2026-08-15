"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";
import { FiFile, FiTrash2, FiUpload } from "react-icons/fi";

export default function ArsipManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setFileUrl(data.url);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileUrl) return alert("Silakan unggah file terlebih dahulu");
    setLoading(true);
    await fetch("/api/arsip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, kategori, fileUrl }),
    });
    setJudul(""); setKategori(""); setFileUrl("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus arsip ini?")) return;
    await fetch(`/api/arsip/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Unggah Arsip Baru</h3>
        <div><label className="label">Judul Dokumen</label><input required className="input" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="contoh: Notulen Rapat Januari 2026" /></div>
        <div><label className="label">Kategori</label><input className="input" value={kategori} onChange={(e) => setKategori(e.target.value)} placeholder="Surat, Notulen, Proposal, LPJ, dll" /></div>
        <div>
          <label className="label">File</label>
          <label className="btn-outline !py-2 !px-4 text-sm cursor-pointer w-full">
            <FiUpload /> {loading ? "Mengunggah..." : fileUrl ? "File terunggah ✓" : "Pilih File"}
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Memproses..." : "Simpan Arsip"}</button>
      </form>

      <div className="md:col-span-2 space-y-3">
        {initialData.map((f) => (
          <div key={f.id} className="card flex items-center gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:bg-white/10 dark:text-accent"><FiFile /></div>
            <div className="flex-1 min-w-0">
              <a href={f.fileUrl} target="_blank" className="font-medium truncate hover:underline block">{f.judul}</a>
              <p className="text-xs text-slate-400">{f.kategori || "Umum"} · {f.diunggahOleh?.name || "-"} · {formatTanggalWaktu(f.createdAt)}</p>
            </div>
            <button onClick={() => handleDelete(f.id)} className="text-red-500 shrink-0"><FiTrash2 size={16} /></button>
          </div>
        ))}
        {initialData.length === 0 && <p className="text-slate-400 text-center py-10">Belum ada arsip diunggah.</p>}
      </div>
    </div>
  );
}
