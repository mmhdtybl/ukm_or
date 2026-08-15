"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import ImageUploader from "@/components/admin/ImageUploader";

type Profil = { name: string; email: string; nim: string; avatar: string | null };

export default function ProfilSayaForm({ initialData }: { initialData: Profil }) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/akun/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan profil");

      setForm((current) => ({ ...current, ...data }));
      setMessage("Profil berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5">
      <ImageUploader
        label="Foto Profil"
        value={form.avatar || ""}
        onChange={(avatar) => setForm((current) => ({ ...current, avatar }))}
        circular
      />

      <div>
        <label className="label" htmlFor="profil-name">Nama</label>
        <input id="profil-name" className="input" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required />
      </div>

      <div>
        <label className="label" htmlFor="profil-email">Email</label>
        <input id="profil-email" type="email" className="input" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required />
      </div>

      <div>
        <label className="label" htmlFor="profil-nim">NPM/NIM</label>
        <input id="profil-nim" className="input bg-slate-100 dark:bg-white/5" value={form.nim} disabled />
        <p className="mt-1 text-xs text-slate-500">NPM/NIM tidak dapat diubah dari halaman profil.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10">{error}</p>}
      {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</p>}

      <button disabled={loading} className="btn-primary" type="submit">
        <FiSave /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
