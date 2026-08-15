"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggal, formatUang } from "@/lib/utils";

export default function KasSayaClient({ riwayat }: { riwayat: any[] }) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jumlah, keterangan, kategori: "Kas Anggota" }),
    });
    setJumlah(""); setKeterangan("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Lapor Pembayaran Kas</h3>
        <div><label className="label">Jumlah (Rp)</label><input type="number" required className="input" value={jumlah} onChange={(e) => setJumlah(e.target.value)} /></div>
        <div><label className="label">Keterangan</label><textarea rows={2} className="input" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="contoh: Kas bulan Agustus" /></div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Mengirim..." : "Ajukan Laporan"}</button>
      </form>

      <div className="card">
        <h3 className="font-semibold mb-4">Riwayat Laporan Saya</h3>
        <div className="space-y-3">
          {riwayat.map((k) => (
            <div key={k.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
              <div>
                <p>{formatUang(k.jumlah)}</p>
                <p className="text-xs text-slate-400">{formatTanggal(k.tanggal)} {k.keterangan ? `· ${k.keterangan}` : ""}</p>
              </div>
              <span className={`badge ${k.status === "DIVERIFIKASI" ? "bg-green-100 text-green-700" : k.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"}`}>
                {k.status}
              </span>
            </div>
          ))}
          {riwayat.length === 0 && <p className="text-slate-400 text-sm">Belum ada riwayat laporan kas.</p>}
        </div>
      </div>
    </div>
  );
}
