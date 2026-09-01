"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggal, formatUang } from "@/lib/utils";

type Metode = "OFFLINE" | "TRANSFER";

export default function KasSayaClient({
  riwayat,
  tujuan,
}: {
  riwayat: any[];
  tujuan: string | null;
}) {
  const router = useRouter();
  const [metode, setMetode] = useState<Metode>("OFFLINE");
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [sudahBayar, setSudahBayar] = useState(false);
  const [loading, setLoading] = useState(false);

  const transferReady = Boolean(tujuan);
  const canSubmit =
    metode === "OFFLINE" || (metode === "TRANSFER" && sudahBayar);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    await fetch("/api/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jumlah,
        keterangan,
        kategori: "Kas Anggota",
        metode,
      }),
    });
    setJumlah("");
    setKeterangan("");
    setSudahBayar(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">Lapor Pembayaran Kas</h3>

        {/* METODE */}
        <div>
          <label className="label">Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMetode("TRANSFER")}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                metode === "TRANSFER"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              Transfer
            </button>
            <button
              type="button"
              onClick={() => setMetode("OFFLINE")}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                metode === "OFFLINE"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              Bayar Offline
            </button>
          </div>
        </div>

        {/* NOMINAL & KETERANGAN */}
        <div>
          <label className="label">Jumlah (Rp)</label>
          <input
            type="number"
            required
            className="input"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Keterangan</label>
          <textarea
            rows={2}
            className="input"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="contoh: Kas bulan Agustus"
          />
        </div>

        {/* TRANSFER: TUNJUKKAN TUJUAN + CEKLIS */}
        {metode === "TRANSFER" && (
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Transfer ke tujuan kas berikut:
              </p>
              {transferReady ? (
                <p className="mt-2 select-all rounded-xl bg-white/70 dark:bg-white/10 px-3 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {tujuan}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Nomer rekening/tujuan transfer belum diatur. Hubungi Bendahara,
                  atau gunakan metode Bayar Offline.
                </p>
              )}
            </div>

            {transferReady && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-white/5 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-primary"
                  checked={sudahBayar}
                  onChange={(e) => setSudahBayar(e.target.checked)}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Saya sudah melakukan transfer ke nomer di atas
                </span>
              </label>
            )}
          </div>
        )}

        <button
          disabled={loading || !canSubmit}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading
            ? "Mengirim..."
            : metode === "TRANSFER"
            ? "Kirim Laporan Transfer"
            : "Kirim Laporan"}
        </button>
      </form>

      <div className="card">
        <h3 className="font-semibold mb-4">Riwayat Laporan Saya</h3>
        <div className="space-y-3">
          {riwayat.map((k) => (
            <div
              key={k.id}
              className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 text-sm"
            >
              <div>
                <p>
                  {formatUang(k.jumlah)}
                  <span className="ml-2 rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
                    {k.metode === "TRANSFER" ? "Transfer" : "Offline"}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {formatTanggal(k.tanggal)}{" "}
                  {k.keterangan ? `· ${k.keterangan}` : ""}
                </p>
              </div>
              <span
                className={`badge ${
                  k.status === "DIVERIFIKASI"
                    ? "bg-green-100 text-green-700"
                    : k.status === "PENDING"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {k.status}
              </span>
            </div>
          ))}
          {riwayat.length === 0 && (
            <p className="text-slate-400 text-sm">Belum ada riwayat laporan kas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
