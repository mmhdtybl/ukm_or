"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUang } from "@/lib/utils";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

type Metode = "OFFLINE" | "TRANSFER";

type BulanKas = {
  key: string;
  label: string;
  jumlah: number;
  metode: string | null;
  keterangan: string | null;
  lunas: boolean;
};

export default function KasSayaClient({
  bulanKas,
  bulanList,
  tujuan,
}: {
  bulanKas: BulanKas[];
  bulanList: { key: string; label: string }[];
  tujuan: string | null;
}) {
  const router = useRouter();
  const defaultBulan = bulanKas.find((b) => !b.lunas)?.key || bulanKas[0]?.key || "";
  const [metode, setMetode] = useState<Metode>("OFFLINE");
  const [bulanTagih, setBulanTagih] = useState(defaultBulan);
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [sudahBayar, setSudahBayar] = useState(false);
  const [loading, setLoading] = useState(false);

  const transferReady = Boolean(tujuan);
  const canSubmit =
    metode === "OFFLINE" || (metode === "TRANSFER" && sudahBayar);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !bulanTagih) return;
    setLoading(true);
    await fetch("/api/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jumlah,
        keterangan,
        kategori: "Kas Anggota",
        metode,
        bulanTagih,
      }),
    });
    setJumlah("");
    setKeterangan("");
    setSudahBayar(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
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

          {/* BULAN TAGIHAN */}
          <div>
            <label className="label">Bayar untuk bulan</label>
            <select
              className="input"
              value={bulanTagih}
              onChange={(e) => setBulanTagih(e.target.value)}
              required
            >
              <option value="" disabled>Pilih bulan</option>
              {bulanList.map((m) => {
                const sudah = bulanKas.find((b) => b.key === m.key)?.lunas;
                return (
                  <option key={m.key} value={m.key}>
                    {m.label} {sudah ? "(sudah dibayar)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* NOMINAL & KETERANGAN */}
          <div>
            <label className="label">Jumlah (Rp)</label>
            <input
              type="number"
              min={1}
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

        {/* RINGKASAN */}
        <div className="card h-fit">
          <h3 className="font-semibold mb-4">Ringkasan Kas Periode Ini</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-primary dark:text-accent">{bulanKas.filter((b) => b.lunas).length}</div>
              <div className="text-xs text-slate-500">Bulan Lunas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{bulanKas.filter((b) => !b.lunas).length}</div>
              <div className="text-xs text-slate-500">Belum Dibayar</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatUang(bulanKas.reduce((s, b) => s + b.jumlah, 0))}</div>
              <div className="text-xs text-slate-500">Total Bayar</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL KAS */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tabel Kas Saya</h3>
          <ExportCsvButton
            filename="data-kas-saya.csv"
            headers={["Bulan-Tahun", "Jumlah", "Metode", "Keterangan", "Status"]}
            rows={bulanKas.map((b) => [b.label, b.jumlah, b.metode || "", b.keterangan || "", b.lunas ? "Lunas" : "Belum"])}
          />
        </div>
        <table className="table-admin">
          <thead>
            <tr>
              <th>Bulan-Tahun</th>
              <th>Jumlah</th>
              <th>Metode Pembayaran</th>
              <th>Keterangan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bulanKas.map((b) => (
              <tr key={b.key}>
                <td className="font-medium">{b.label}</td>
                <td>{b.jumlah > 0 ? formatUang(b.jumlah) : "-"}</td>
                <td>
                  {b.metode === "TRANSFER" ? (
                    <span className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Transfer</span>
                  ) : b.metode === "OFFLINE" ? (
                    <span className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Offline</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{b.keterangan || "-"}</td>
                <td>
                  <span className={`badge ${b.lunas ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                    {b.lunas ? "Lunas" : "Belum"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
