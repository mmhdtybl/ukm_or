"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";
import { FiTrash2, FiMail } from "react-icons/fi";

const labelJenis: Record<string, string> = {
  BUG: "Bug sistem",
  PERBAIKAN: "Permintaan perbaikan",
  SARAN: "Saran pengembangan",
  LAINNYA: "Lainnya",
};

function detailSubjek(subjek: string) {
  const cocok = subjek.match(/^\[(BUG|PERBAIKAN|SARAN|LAINNYA)\]\s*(.*)$/);
  const jenis = cocok?.[1] || "LAINNYA";
  return { jenis: labelJenis[jenis], subjek: cocok?.[2] || subjek };
}

export default function KontakManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);

  async function openDetail(item: any) {
    setDetail(item);
    if (!item.isRead) {
      await fetch(`/api/kontak/${item.id}`, { method: "PATCH" });
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus laporan ini?")) return;
    await fetch(`/api/kontak/${id}`, { method: "DELETE" });
    setDetail(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {initialData.map((laporan) => (
        <div key={laporan.id} onClick={() => openDetail(laporan)} className={`card cursor-pointer flex items-center justify-between gap-4 ${!laporan.isRead ? "border-l-4 border-accent" : ""}`}>
          <div className="flex items-center gap-3 min-w-0">
            <FiMail className={!laporan.isRead ? "text-accent" : "text-slate-300"} />
            <div className="min-w-0">
              <p className="font-medium truncate">{detailSubjek(laporan.subjek).subjek}</p>
              <p className="text-xs text-slate-500 truncate">{detailSubjek(laporan.subjek).jenis} · {laporan.nama} · {laporan.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400">{formatTanggalWaktu(laporan.createdAt)}</span>
            <button onClick={(event) => { event.stopPropagation(); handleDelete(laporan.id); }} className="text-red-500" aria-label="Hapus laporan"><FiTrash2 size={14} /></button>
          </div>
        </div>
      ))}
      {initialData.length === 0 && <p className="text-slate-400 text-center py-10">Belum ada laporan pengguna.</p>}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setDetail(null)}>
          <div className="card max-w-md w-full" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">{detailSubjek(detail.subjek).subjek}</h3>
            <p className="text-xs text-slate-500 mb-4">{detailSubjek(detail.subjek).jenis} · {detail.nama} · {detail.email} · {formatTanggalWaktu(detail.createdAt)}</p>
            <p className="text-sm whitespace-pre-line">{detail.pesan}</p>
            <button onClick={() => setDetail(null)} className="btn-outline w-full mt-4">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
