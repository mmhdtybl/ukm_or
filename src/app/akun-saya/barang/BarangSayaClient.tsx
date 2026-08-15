"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";

export default function BarangSayaClient({ barang, komentarSaya }: { barang: any[]; komentarSaya: any[] }) {
  const router = useRouter();
  const [jenis, setJenis] = useState("REQUEST");
  const [barangId, setBarangId] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/komentar-barang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jenis, barangId: barangId || null, pesan }),
    });
    setPesan(""); setBarangId("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold">Ajukan Request / Laporan</h3>
          <div>
            <label className="label">Jenis</label>
            <select className="input" value={jenis} onChange={(e) => setJenis(e.target.value)}>
              <option value="REQUEST">Request Barang Baru</option>
              <option value="LAPOR_RUSAK">Lapor Barang Rusak</option>
            </select>
          </div>
          {jenis === "LAPOR_RUSAK" && (
            <div>
              <label className="label">Barang Terkait (opsional)</label>
              <select className="input" value={barangId} onChange={(e) => setBarangId(e.target.value)}>
                <option value="">Pilih barang</option>
                {barang.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
            </div>
          )}
          <div><label className="label">Pesan</label><textarea required rows={3} className="input" value={pesan} onChange={(e) => setPesan(e.target.value)} placeholder="Jelaskan kebutuhan atau kerusakan..." /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Mengirim..." : "Kirim"}</button>
        </form>

        <div className="card">
          <h3 className="font-semibold mb-3">Riwayat Pengajuan Saya</h3>
          <div className="space-y-2">
            {komentarSaya.map((k: any) => (
              <div key={k.id} className="text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{k.jenis === "REQUEST" ? "Request" : "Lapor Rusak"}</span>
                  <span className={`badge ${k.status === "DITINDAK" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>{k.status}</span>
                </div>
                <p className="text-xs text-slate-400">{formatTanggalWaktu(k.createdAt)}</p>
              </div>
            ))}
            {komentarSaya.length === 0 && <p className="text-slate-400 text-sm">Belum ada pengajuan.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Daftar Barang UKM</h3>
        <div className="space-y-2">
          {barang.map((b) => (
            <div key={b.id} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>{b.nama} <span className="text-slate-400">({b.divisi})</span></span>
              <span className={`badge ${b.kondisi === "Baik" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{b.kondisi}</span>
            </div>
          ))}
          {barang.length === 0 && <p className="text-slate-400 text-sm">Belum ada data barang.</p>}
        </div>
      </div>
    </div>
  );
}
