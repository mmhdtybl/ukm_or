"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";
import { FiTrash2, FiMail } from "react-icons/fi";

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
    if (!confirm("Hapus pesan ini?")) return;
    await fetch(`/api/kontak/${id}`, { method: "DELETE" });
    setDetail(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {initialData.map((k) => (
        <div key={k.id} onClick={() => openDetail(k)} className={`card cursor-pointer flex items-center justify-between gap-4 ${!k.isRead ? "border-l-4 border-accent" : ""}`}>
          <div className="flex items-center gap-3 min-w-0">
            <FiMail className={!k.isRead ? "text-accent" : "text-slate-300"} />
            <div className="min-w-0">
              <p className="font-medium truncate">{k.subjek}</p>
              <p className="text-xs text-slate-500 truncate">{k.nama} · {k.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400">{formatTanggalWaktu(k.createdAt)}</span>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(k.id); }} className="text-red-500"><FiTrash2 size={14} /></button>
          </div>
        </div>
      ))}
      {initialData.length === 0 && <p className="text-slate-400 text-center py-10">Belum ada pesan masuk.</p>}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setDetail(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">{detail.subjek}</h3>
            <p className="text-xs text-slate-500 mb-4">{detail.nama} · {detail.email} · {formatTanggalWaktu(detail.createdAt)}</p>
            <p className="text-sm whitespace-pre-line">{detail.pesan}</p>
            <button onClick={() => setDetail(null)} className="btn-outline w-full mt-4">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
