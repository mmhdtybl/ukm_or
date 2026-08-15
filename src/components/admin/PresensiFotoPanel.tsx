"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatTanggalWaktu } from "@/lib/utils";
import { FiCamera, FiTrash2 } from "react-icons/fi";

type Foto = {
  id: string;
  fotoUrl: string;
  keterangan: string | null;
  createdAt: string;
  diunggahOlehId?: string | null;
  diunggahOleh?: { name: string; role: string } | null;
};

export default function PresensiFotoPanel({
  agendaId,
  initialData,
  currentUserId,
  canDeleteAny,
}: {
  agendaId: string;
  initialData: Foto[];
  currentUserId?: string;
  canDeleteAny: boolean;
}) {
  const router = useRouter();
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();

    if (!uploadData.url) {
      setLoading(false);
      alert("Gagal mengunggah foto.");
      return;
    }

    await fetch("/api/presensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agendaId, fotoUrl: uploadData.url, keterangan }),
    });

    setKeterangan("");
    setLoading(false);
    e.target.value = "";
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto dokumentasi ini?")) return;
    await fetch(`/api/presensi/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h3 className="font-semibold">Unggah Foto Dokumentasi Kegiatan</h3>
        <p className="text-xs text-slate-500">
          Presensi dilakukan secara manual: unggah foto kegiatan/event yang sedang berlangsung sebagai bukti dokumentasi kehadiran.
        </p>
        <input placeholder="Keterangan (opsional)" className="input" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
        <label className="btn-primary !py-2 !px-4 text-sm cursor-pointer w-fit">
          <FiCamera /> {loading ? "Mengunggah..." : "Pilih & Unggah Foto"}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {initialData.map((f) => (
          <div key={f.id} className="card !p-3">
            <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
              <Image src={f.fotoUrl} alt={f.keterangan || "Dokumentasi kegiatan"} fill className="object-cover" />
            </div>
            {f.keterangan && <p className="text-sm mb-1">{f.keterangan}</p>}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{f.diunggahOleh?.name || "Anonim"} · {formatTanggalWaktu(f.createdAt)}</span>
              {(canDeleteAny || f.diunggahOlehId === currentUserId) && (
                <button onClick={() => handleDelete(f.id)} className="text-red-500 shrink-0"><FiTrash2 size={13} /></button>
              )}
            </div>
          </div>
        ))}
        {initialData.length === 0 && <p className="text-slate-400 text-sm col-span-full text-center py-8">Belum ada dokumentasi foto untuk kegiatan ini.</p>}
      </div>
    </div>
  );
}
