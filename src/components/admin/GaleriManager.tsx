"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import { FiTrash2 } from "react-icons/fi";

export default function GaleriManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [gambar, setGambar] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!gambar) return alert("Silakan unggah gambar terlebih dahulu");
    setLoading(true);
    await fetch("/api/galeri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, kategori, gambar }),
    });
    setJudul(""); setKategori(""); setGambar("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    await fetch(`/api/galeri/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleAdd} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Tambah Foto</h3>
        <div>
          <label className="label">Judul</label>
          <input required className="input" value={judul} onChange={(e) => setJudul(e.target.value)} />
        </div>
        <div>
          <label className="label">Kategori</label>
          <input className="input" placeholder="Kegiatan / Prestasi / dll" value={kategori} onChange={(e) => setKategori(e.target.value)} />
        </div>
        <ImageUploader value={gambar} onChange={setGambar} />
        <button disabled={loading} className="btn-primary w-full">{loading ? "Mengunggah..." : "Tambah ke Galeri"}</button>
      </form>

      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {initialData.map((g) => (
          <div key={g.id} className="relative aspect-square rounded-xl overflow-hidden group">
            <Image src={g.gambar} alt={g.judul} fill className="object-cover" />
            <button onClick={() => handleDelete(g.id)} className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition">
              <FiTrash2 size={12} />
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-1.5 truncate">{g.judul}</div>
          </div>
        ))}
        {initialData.length === 0 && <p className="text-slate-400 col-span-full text-center py-10">Belum ada foto.</p>}
      </div>
    </div>
  );
}
