"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiKey, FiPlus, FiTrash2 } from "react-icons/fi";

type Target = { id: string; nama: string; nim?: string; jabatan?: string; userId?: string | null; user?: { id: string; email: string } | null };

export default function AkunManager({ anggota, pengurus }: { anggota: Target[]; pengurus: Target[] }) {
  const router = useRouter();
  const targets = useMemo(() => [
    ...anggota.filter((x) => !x.userId).map((x) => ({ ...x, tipe: "ANGGOTA" })),
    ...pengurus.filter((x) => !x.userId).map((x) => ({ ...x, tipe: "PENGURUS" })),
  ], [anggota, pengurus]);
  const accounts = useMemo(() => [
    ...anggota.filter((x) => x.user).map((x) => ({ ...x, tipe: "Anggota" })),
    ...pengurus.filter((x) => x.user).map((x) => ({ ...x, tipe: "Pengurus" })),
  ], [anggota, pengurus]);
  const [targetKey, setTargetKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nim, setNim] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const selected = targets.find((x: any) => `${x.tipe}:${x.id}` === targetKey) as any;

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return alert("Pilih orang yang akan dibuatkan akun.");
    setLoading(true);
    const res = await fetch("/api/admin/akun", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipe: selected.tipe, targetId: selected.id, nim, email, password }) });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.message || "Gagal membuat akun.");
    setTargetKey(""); setEmail(""); setPassword(""); setNim("");
    alert("Akun berhasil dibuat."); router.refresh();
  }

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/akun/${editing.user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.message || "Gagal menyimpan akun.");
    setEditing(null); setEmail(""); setPassword(""); alert("Email/password berhasil diperbarui."); router.refresh();
  }

  async function deleteAccount(item: any) {
    if (!confirm(`Hapus akses login ${item.nama}? Data ${item.tipe.toLowerCase()} tetap tersimpan.`)) return;
    const res = await fetch(`/api/admin/akun/${item.user.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.message || "Gagal menghapus akun.");
    router.refresh();
  }

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Kelola Akun & Password</h1><p className="text-slate-500">Admin dapat membuat akun bagi anggota/pengurus, mengganti email, dan mengatur ulang password.</p></div>
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={createAccount} className="card space-y-4"><h2 className="font-semibold flex items-center gap-2"><FiPlus /> Buat Akun Baru</h2>
        <div><label className="label">Anggota / Pengurus</label><select required className="input" value={targetKey} onChange={(e) => { setTargetKey(e.target.value); setNim(""); }}><option value="">Pilih orang tanpa akun</option>{targets.map((x: any) => <option key={`${x.tipe}:${x.id}`} value={`${x.tipe}:${x.id}`}>{x.nama} — {x.tipe === "ANGGOTA" ? `NIM ${x.nim}` : x.jabatan}</option>)}</select></div>
        {selected?.tipe === "PENGURUS" && <div><label className="label">NIM Pengurus</label><input required className="input" value={nim} onChange={(e) => setNim(e.target.value)} /></div>}
        <div><label className="label">Email</label><input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password awal</label><input required minLength={6} type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /><p className="text-xs text-slate-400 mt-1">Minimal 6 karakter.</p></div>
        <button disabled={loading} className="btn-primary">{loading ? "Menyimpan..." : "Buat Akun"}</button>
      </form>
      {editing && <form onSubmit={saveAccount} className="card space-y-4"><h2 className="font-semibold flex items-center gap-2"><FiKey /> Ubah Kredensial: {editing.nama}</h2>
        <div><label className="label">Email</label><input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password baru</label><input minLength={6} type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kosongkan jika tidak diubah" /></div>
        <div className="flex gap-2"><button disabled={loading} className="btn-primary">Simpan Kredensial</button><button type="button" onClick={() => { setEditing(null); setEmail(""); setPassword(""); }} className="btn-outline">Batal</button></div>
      </form>}
    </div>
    <div className="card overflow-x-auto"><table className="table-admin"><thead><tr><th>Nama</th><th>Tipe</th><th>Email</th><th>Aksi</th></tr></thead><tbody>{accounts.map((item: any) => <tr key={item.user.id}><td>{item.nama}</td><td>{item.tipe}</td><td>{item.user.email}</td><td className="flex gap-2"><button onClick={() => { setEditing(item); setEmail(item.user.email); setPassword(""); }} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><FiEdit2 /> Ubah</button><button onClick={() => deleteAccount(item)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><FiTrash2 /> Hapus</button></td></tr>)}{accounts.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">Belum ada akun.</td></tr>}</tbody></table></div>
  </div>;
}
