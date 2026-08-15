"use client";

import { useState } from "react";

export default function PendaftaranForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Terjadi kesalahan");
        setStatus("error");
        return;
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Terjadi kesalahan jaringan");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <p className="text-green-600 font-semibold text-lg mb-2">Pendaftaran Berhasil Dikirim!</p>
        <p className="text-slate-500 text-sm">Silakan cek email Anda secara berkala. Jika diterima, kamu akan mendapat link grup WhatsApp untuk bergabung — bukan akun login.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nama Lengkap</label>
          <input name="nama" required className="input" />
        </div>
        <div>
          <label className="label">NIM</label>
          <input name="nim" required className="input" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" required className="input" />
        </div>
        <div>
          <label className="label">No. HP / WhatsApp</label>
          <input name="noHp" required className="input" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Program Studi</label>
          <input name="prodi" required className="input" />
        </div>
        <div>
          <label className="label">Angkatan</label>
          <input name="angkatan" required className="input" placeholder="contoh: 2024" />
        </div>
      </div>
      <div>
        <label className="label">Cabang Olahraga yang Diminati</label>
        <select name="divisiPilihan" required className="input">
          <option value="">Pilih cabang olahraga</option>
          <option value="Voli">Voli</option>
          <option value="Futsal">Futsal</option>
          <option value="Bulutangkis">Bulutangkis</option>
          <option value="E-Sport">E-Sport</option>
          <option value="Taekwondo">Taekwondo</option>
          <option value="Basket">Basket</option>
        </select>
      </div>
      <div>
        <label className="label">Motivasi Bergabung</label>
        <textarea name="motivasi" required rows={4} className="input" placeholder="Ceritakan motivasimu bergabung dengan UKM ini..." />
      </div>
      <button disabled={status === "loading"} className="btn-primary w-full">
        {status === "loading" ? "Mengirim..." : "Kirim Pendaftaran"}
      </button>
      {status === "error" && <p className="text-red-500 text-sm">{errorMsg}</p>}
    </form>
  );
}
