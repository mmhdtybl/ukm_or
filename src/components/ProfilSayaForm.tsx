"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import ImageUploader from "@/components/admin/ImageUploader";
import PasswordInput from "@/components/PasswordInput";
import { DIVISI_OPTIONS } from "@/lib/divisi";

type Profil = {
  name: string;
  nim: string;
  avatar: string | null;
  prodi: string;
  divisi: string;
  jabatan: string;
  noHp: string;
  tanggalLahir: string;
  periode: string;
};

const EMPTY: Profil = {
  name: "",
  nim: "",
  avatar: null,
  prodi: "",
  divisi: "",
  jabatan: "",
  noHp: "",
  tanggalLahir: "",
  periode: "",
};

export default function ProfilSayaForm({
  initialData,
  isAdmin = false,
  tipeProfil = "ANGGOTA",
}: {
  initialData: Partial<Profil>;
  isAdmin?: boolean;
  tipeProfil?: "ADMIN" | "PENGURUS" | "ANGGOTA";
}) {
  const router = useRouter();
  const [form, setForm] = useState<Profil>({ ...EMPTY, ...initialData });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isMember = tipeProfil === "ANGGOTA" || tipeProfil === "PENGURUS";
  const isPengurus = tipeProfil === "PENGURUS";

  function set<K extends keyof Profil>(key: K, value: Profil[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (isAdmin && password && password !== passwordConfirmation) {
      setError("Konfirmasi password baru tidak sama.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/akun/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          avatar: form.avatar,
          prodi: form.prodi,
          divisi: form.divisi,
          jabatan: form.jabatan,
          noHp: form.noHp,
          tanggalLahir: form.tanggalLahir,
          periode: form.periode,
          ...(isAdmin ? { nim: form.nim, password } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan profil");

      setForm((current) => ({
        ...current,
        name: data.name ?? current.name,
        nim: data.nim ?? current.nim,
        avatar: data.avatar ?? current.avatar,
      }));
      setPassword("");
      setPasswordConfirmation("");
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
        onChange={(avatar) => set("avatar", avatar)}
        circular
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="profil-name">Nama</label>
          <input id="profil-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>

        <div>
          <label className="label" htmlFor="profil-nim">NPM/NIM</label>
          <input id="profil-nim" className={`input ${isAdmin ? "" : "bg-slate-100 dark:bg-white/5"}`} value={form.nim} onChange={(e) => set("nim", e.target.value)} disabled={!isAdmin} required />
          <p className="mt-1 text-xs text-slate-500">{isAdmin ? "NPM/NIM digunakan untuk login." : "NPM/NIM tidak dapat diubah dari halaman profil."}</p>
        </div>
      </div>

      {isMember && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="profil-prodi">Program Studi / Jurusan</label>
              <input id="profil-prodi" className="input" value={form.prodi} onChange={(e) => set("prodi", e.target.value)} placeholder="contoh: Teknik Informatika" />
            </div>
            <div>
              <label className="label" htmlFor="profil-divisi">Divisi</label>
              <select id="profil-divisi" className="input" value={form.divisi} onChange={(e) => set("divisi", e.target.value)}>
                <option value="">-- Pilih Divisi --</option>
                {DIVISI_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {isPengurus && (
              <div>
                <label className="label" htmlFor="profil-jabatan">Jabatan</label>
                <input id="profil-jabatan" className="input" value={form.jabatan} onChange={(e) => set("jabatan", e.target.value)} placeholder="contoh: Ketua" />
              </div>
            )}
            <div>
              <label className="label" htmlFor="profil-nohp">No. HP / WhatsApp</label>
              <input id="profil-nohp" className="input" value={form.noHp} onChange={(e) => set("noHp", e.target.value)} placeholder="contoh: 081234567890" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="profil-tgl">Tanggal Lahir</label>
              <input id="profil-tgl" type="date" className="input" value={form.tanggalLahir} onChange={(e) => set("tanggalLahir", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="profil-periode">Periode Kepengurusan</label>
              <input id="profil-periode" className="input" value={form.periode} onChange={(e) => set("periode", e.target.value)} placeholder="contoh: 2026/2027" />
            </div>
          </div>
        </>
      )}

      {isAdmin && <>
        <div>
          <label className="label" htmlFor="profil-password">Password baru <span className="font-normal text-slate-400">(opsional)</span></label>
          <PasswordInput id="profil-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kosongkan jika tidak diubah" />
          <p className="mt-1 text-xs text-slate-500">Minimal 6 karakter.</p>
        </div>
        <div>
          <label className="label" htmlFor="profil-password-confirmation">Konfirmasi password baru</label>
          <PasswordInput id="profil-password-confirmation" minLength={6} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} disabled={!password} required={Boolean(password)} />
        </div>
      </>}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10">{error}</p>}
      {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</p>}

      <button disabled={loading} className="btn-primary" type="submit">
        <FiSave /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
