"use client";

import { useState } from "react";

export default function KontakForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <p className="text-green-600 font-medium">Laporan Anda berhasil dikirim. Terima kasih atas masukannya!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nama</label>
        <input name="nama" required className="input" placeholder="Nama lengkap" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required className="input" placeholder="email@contoh.com" />
      </div>
      <div>
        <label className="label">Subjek</label>
        <input name="subjek" required className="input" placeholder="Contoh: Tombol pendaftaran tidak dapat dibuka" />
      </div>
      <div>
        <label className="label">Jenis Laporan</label>
        <select name="jenis" required defaultValue="BUG" className="input">
          <option value="BUG">Bug atau kesalahan sistem</option>
          <option value="PERBAIKAN">Permintaan perbaikan</option>
          <option value="SARAN">Saran pengembangan</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
      </div>
      <div>
        <label className="label">Detail Laporan</label>
        <textarea name="pesan" required rows={5} className="input" placeholder="Jelaskan kendala atau perbaikan yang Anda harapkan. Sertakan langkah yang dilakukan bila melaporkan bug." />
      </div>
      <button disabled={status === "loading"} className="btn-primary w-full">
        {status === "loading" ? "Mengirim..." : "Kirim Laporan"}
      </button>
      {status === "error" && <p className="text-red-500 text-sm">Terjadi kesalahan, silakan coba lagi.</p>}
    </form>
  );
}
