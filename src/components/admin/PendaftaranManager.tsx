"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";

const statusColor: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-600",
  DITERIMA: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-600",
};

export default function PendaftaranManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("PENDING");
  const [detail, setDetail] = useState<any>(null);

  async function handleAction(id: string, status: "DITERIMA" | "DITOLAK") {
    if (!confirm(`Yakin ingin ${status === "DITERIMA" ? "menerima" : "menolak"} pendaftaran ini? Email notifikasi akan otomatis dikirim (jika diterima, berisi link grup WhatsApp — bukan akun login).`)) return;
    setLoadingId(id);
    await fetch(`/api/pendaftaran/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    setDetail(null);
    router.refresh();
  }

  const filtered = filter === "SEMUA" ? initialData : initialData.filter((p) => p.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {["PENDING", "DITERIMA", "DITOLAK", "SEMUA"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`badge ${filter === f ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>
            {f === "PENDING" ? "Menunggu" : f === "SEMUA" ? "Semua" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>Nama</th><th>NIM</th><th>Prodi</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">
                  <button onClick={() => setDetail(p)} className="hover:text-primary dark:hover:text-accent underline decoration-dotted">{p.nama}</button>
                </td>
                <td>{p.nim}</td>
                <td>{p.prodi}</td>
                <td>{formatTanggalWaktu(p.createdAt)}</td>
                <td><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>
                <td>
                  {p.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button disabled={loadingId === p.id} onClick={() => handleAction(p.id, "DITERIMA")} className="text-xs font-semibold text-green-600">Terima</button>
                      <button disabled={loadingId === p.id} onClick={() => handleAction(p.id, "DITOLAK")} className="text-xs font-semibold text-red-500">Tolak</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-slate-400 py-6">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setDetail(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Detail Pendaftaran</h3>
            <ul className="text-sm space-y-1.5">
              <li><b>Nama:</b> {detail.nama}</li>
              <li><b>NIM:</b> {detail.nim}</li>
              <li><b>Email:</b> {detail.email}</li>
              <li><b>No. HP:</b> {detail.noHp}</li>
              <li><b>Prodi:</b> {detail.prodi}</li>
              <li><b>Angkatan:</b> {detail.angkatan}</li>
              <li><b>Divisi Pilihan:</b> {detail.divisiPilihan || "-"}</li>
              <li><b>Motivasi:</b> {detail.motivasi}</li>
            </ul>
            <button onClick={() => setDetail(null)} className="btn-outline w-full mt-4">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
