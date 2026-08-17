"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTableActions from "./DataTableActions";
import { FiEdit2, FiKey, FiPlus } from "react-icons/fi";

const DIVISI_OPTIONS = ["Voli", "Futsal", "Bulutangkis", "E-Sport", "Taekwondo", "Basket"];

const emptyForm = { id: "", nama: "", nim: "", email: "", prodi: "", angkatan: "", noHp: "", divisi: "", periode: "2025/2026", status: "Aktif" };

export default function AnggotaManager({
  initialData,
  divisiLock,
  readOnly,
  isAdmin,
}: {
  initialData: any[];
  divisiLock: string | null;
  readOnly: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ ...emptyForm, divisi: divisiLock || "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [akunModal, setAkunModal] = useState<{ nim: string; password: string } | null>(null);
  const [emailInput, setEmailInput] = useState<Record<string, string>>({});

  const editing = Boolean(form.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(editing ? `/api/anggota/${form.id}` : "/api/anggota", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Gagal menyimpan data anggota.");
      return;
    }
    setForm({ ...emptyForm, divisi: divisiLock || "" });
    setShowForm(false);
    if (data.password) setAkunModal({ nim: data.nim, password: data.password });
    router.refresh();
  }

  function mulaiEdit(anggota: any) {
    setForm({
      id: anggota.id,
      nama: anggota.nama,
      nim: anggota.nim,
      email: "",
      prodi: anggota.prodi,
      angkatan: anggota.angkatan,
      noHp: anggota.noHp || "",
      divisi: divisiLock || anggota.divisi || "",
      periode: anggota.periode || "",
      status: anggota.status,
    });
    setShowForm(true);
  }

  async function updateStatus(id: string, status: string, current: any) {
    await fetch(`/api/anggota/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, status }),
    });
    router.refresh();
  }

  async function buatAkun(id: string) {
    const email = emailInput[id];
    if (!email) return alert("Masukkan email anggota terlebih dahulu untuk mengirim kredensial.");
    const res = await fetch(`/api/anggota/${id}/akun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Gagal membuat akun.");
      return;
    }
    setAkunModal({ nim: data.nim, password: data.password });
    router.refresh();
  }

  async function kelolaAkun(id: string, aksi: "ubah" | "hapus", akun?: any) {
    if (aksi === "hapus") {
      if (!confirm("Hapus akun login anggota ini? Data anggota tetap tersimpan.")) return;
      const res = await fetch(`/api/anggota/${id}/akun`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || "Gagal menghapus akun.");
      router.refresh();
      return;
    }
    const email = prompt("Email akun", akun?.email || "");
    if (!email) return;
    const password = prompt("Password baru (kosongkan untuk tidak mengubah password)", "");
    if (password === null) return;
    const res = await fetch(`/api/anggota/${id}/akun`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.message || "Gagal memperbarui akun.");
    alert("Kredensial akun berhasil diperbarui.");
    router.refresh();
  }

  const filtered = initialData.filter((a) => a.nama.toLowerCase().includes(q.toLowerCase()) || a.nim.includes(q));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:items-center sm:justify-between">
        <input placeholder="Cari nama/NIM..." className="input max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} />
        {!readOnly && (
          <button onClick={() => { setForm({ ...emptyForm, divisi: divisiLock || "" }); setShowForm(!showForm); }} className="btn-primary !py-2 !px-4 text-sm w-fit">
            <FiPlus /> Tambah Anggota
          </button>
        )}
      </div>

      {showForm && !readOnly && (
        <form onSubmit={handleSubmit} className="card grid sm:grid-cols-2 gap-4 mb-6">
          <h2 className="sm:col-span-2 font-semibold">{editing ? "Edit Anggota" : "Tambah Anggota"}</h2>
          <div><label className="label">Nama</label><input required className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
          <div><label className="label">NIM</label><input required disabled={editing} className="input disabled:bg-slate-100 dark:disabled:bg-white/5" value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} /></div>
          {!editing && <div><label className="label">Email untuk akun login <span className="text-slate-400 font-normal">(opsional)</span></label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" /><p className="mt-1 text-xs text-slate-400">Isi email untuk langsung membuat akun anggota.</p></div>}
          <div><label className="label">Prodi</label><input required className="input" value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} /></div>
          <div><label className="label">Angkatan</label><input required className="input" value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: e.target.value })} /></div>
          <div><label className="label">No. HP</label><input className="input" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })} /></div>
          <div>
            <label className="label">Divisi</label>
            {divisiLock ? (
              <input disabled className="input bg-slate-100 dark:bg-white/5" value={divisiLock} />
            ) : (
              <select required className="input" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
                <option value="">Pilih divisi</option>
                {DIVISI_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>
          <div><label className="label">Periode Keanggotaan</label><input className="input" value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })} placeholder="2025/2026" /></div>
          {editing && (
            <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="Aktif">Aktif</option><option value="Non-Aktif">Non-Aktif</option><option value="Alumni">Alumni</option></select></div>
          )}
          <div className="sm:col-span-2">
            <div className="flex gap-2">
              <button disabled={loading} className="btn-primary">{loading ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Anggota"}</button>
              {editing && <button type="button" onClick={() => { setForm({ ...emptyForm, divisi: divisiLock || "" }); setShowForm(false); }} className="btn-outline">Batal</button>}
            </div>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>Nama</th><th>NIM</th><th>Prodi</th><th>Divisi</th><th>Status</th><th>Akun</th>{!readOnly && <th>Aksi</th>}</tr></thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{a.nama}</td><td>{a.nim}</td><td>{a.prodi}</td><td>{a.divisi || "-"}</td>
                <td>
                  {readOnly ? (
                    <span className="badge bg-slate-100 text-slate-600">{a.status}</span>
                  ) : (
                    <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value, a)} className="input !py-1 !px-2 text-xs">
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  )}
                </td>
                <td>
                  {a.userId ? (
                    <div className="flex items-center gap-2"><span className="badge bg-green-100 text-green-700">Ada</span>{isAdmin && <><button onClick={() => kelolaAkun(a.id, "ubah", a.user)} className="text-xs font-semibold text-blue-600">Kredensial</button><button onClick={() => kelolaAkun(a.id, "hapus")} className="text-xs font-semibold text-red-600">Hapus</button></>}</div>
                  ) : readOnly ? (
                    <span className="badge bg-orange-100 text-orange-600">Belum</span>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <input
                        type="email"
                        placeholder="email anggota"
                        className="input !py-1 !px-2 text-xs w-32"
                        value={emailInput[a.id] || ""}
                        onChange={(e) => setEmailInput({ ...emailInput, [a.id]: e.target.value })}
                      />
                      <button onClick={() => buatAkun(a.id)} className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0">
                        <FiKey size={12} />
                      </button>
                    </div>
                  )}
                </td>
                {!readOnly && <td className="flex gap-2"><button onClick={() => mulaiEdit(a)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><FiEdit2 size={13} /> Edit</button><DataTableActions deleteUrl={`/api/anggota/${a.id}`} /></td>}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={readOnly ? 6 : 7} className="text-center text-slate-400 py-6">Tidak ada data anggota.</td></tr>}
          </tbody>
        </table>
      </div>

      {akunModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={() => setAkunModal(null)}>
          <div className="card max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-3">Akun Berhasil Dibuat</h3>
            <p className="text-sm mb-1"><b>NPM/NIM:</b> {akunModal.nim}</p>
            <p className="text-sm mb-4"><b>Password:</b> {akunModal.password}</p>
            <p className="text-xs text-slate-500 mb-4">Kredensial ini juga sudah dikirim ke email anggota. Simpan/salin sekarang, tidak akan ditampilkan lagi.</p>
            <button onClick={() => setAkunModal(null)} className="btn-primary w-full">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
