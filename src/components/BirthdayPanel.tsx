"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiGift, FiSend } from "react-icons/fi";

export type OrangUlangTahun = {
  id: string;
  nama: string;
  tipe: "ANGGOTA" | "PENGURUS";
  jabatan?: string;
  foto?: string | null;
  ucapan: { id: string; pengirim: string; pesan: string; createdAt: string }[];
};

export default function BirthdayPanel({ orang }: { orang: OrangUlangTahun[] }) {
  const router = useRouter();
  const [pesan, setPesan] = useState("");
  const [target, setTarget] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (orang.length === 0) return null;

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!target || !pesan.trim()) return;
    setLoading(true);
    const orangTerpilih = orang.find((o) => o.id === target);
    await fetch("/api/ucapan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipe: orangTerpilih?.tipe, id: target, pesan }),
    });
    setPesan("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-accent">
          <FiGift />
        </div>
        <div>
          <h2 className="font-bold">Selamat Ulang Tahun 🎂</h2>
          <p className="text-xs text-slate-500">Yang berulang tahun hari ini</p>
        </div>
      </div>

      <div className="space-y-4">
        {orang.map((o) => (
          <div key={o.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              {o.foto ? (
                <img src={o.foto} alt={o.nama} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white font-bold">
                  {o.nama.trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold">{o.nama}</p>
                <p className="text-xs text-slate-500">
                  {o.tipe === "PENGURUS" ? (o.jabatan || "Pengurus") : "Anggota"}
                </p>
              </div>
            </div>

            {/* DAFTAR UCAPAN */}
            {o.ucapan.length > 0 && (
              <div className="mt-3 space-y-2">
                {o.ucapan.map((u) => (
                  <div key={u.id} className="rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm">
                    <span className="font-semibold">{u.pengirim}: </span>
                    <span className="text-slate-600 dark:text-slate-300">{u.pesan}</span>
                  </div>
                ))}
              </div>
            )}

            {/* FORM UCAPAN */}
            <form onSubmit={kirim} className="mt-3 flex gap-2">
              <input
                className="input flex-1"
                placeholder="Tulis selamat..."
                value={target === o.id ? pesan : ""}
                onChange={(e) => {
                  setTarget(o.id);
                  setPesan(e.target.value);
                }}
              />
              <button
                type="submit"
                disabled={loading || (target !== o.id) || !pesan.trim()}
                className="btn-primary px-4 disabled:opacity-40"
                aria-label="Kirim ucapan"
              >
                <FiSend />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
