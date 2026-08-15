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
    return <p className="text-green-600 font-medium">Pesan Anda berhasil terkirim. Terima kasih!</p>;
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
        <input name="subjek" required className="input" placeholder="Subjek pesan" />
      </div>
      <div>
        <label className="label">Pesan</label>
        <textarea name="pesan" required rows={4} className="input" placeholder="Tuliskan pesan Anda..." />
      </div>
      <button disabled={status === "loading"} className="btn-primary w-full">
        {status === "loading" ? "Mengirim..." : "Kirim Pesan"}
      </button>
      {status === "error" && <p className="text-red-500 text-sm">Terjadi kesalahan, silakan coba lagi.</p>}
    </form>
  );
}
