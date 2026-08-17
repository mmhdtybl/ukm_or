"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import DataTableActions from "./DataTableActions";

const emptyForm = {
  id: "", nama: "", nim: "", email: "", jabatan: "", kodeJabatan: "KETUA_UMUM", kelompok: "Inti",
  divisi: "", foto: "", periodeMulai: "2025/2026", periodeAkhir: "", urutan: 0, isActive: true,
};

// Setiap kode jabatan sudah punya kelompok & label default agar konsisten dengan hak akses di lib/permissions.ts
const KODE_JABATAN_OPTIONS = [
  { value: "DPO", label: "DPO (Dewan Pertimbangan Organisasi)", kelompok: "DPO", jabatanDefault: "Anggota DPO" },
  { value: "KETUA_UMUM", label: "Ketua Umum", kelompok: "Inti", jabatanDefault: "Ketua Umum" },
  { value: "WAKIL_KETUA", label: "Wakil Ketua Umum", kelompok: "Inti", jabatanDefault: "Wakil Ketua Umum" },
  { value: "SEKRETARIS", label: "Sekretaris", kelompok: "Inti", jabatanDefault: "Sekretaris" },
  { value: "BENDAHARA", label: "Bendahara", kelompok: "Inti", jabatanDefault: "Bendahara" },
  { value: "BIDANG_SDM", label: "Bidang SDM", kelompok: "Bidang", jabatanDefault: "Bidang SDM" },
  { value: "BIDANG_INVENTARIS", label: "Bidang Inventaris", kelompok: "Bidang", jabatanDefault: "Bidang Inventaris" },
  { value: "BIDANG_MEDIA", label: "Bidang Media Informasi", kelompok: "Bidang", jabatanDefault: "Bidang Media Informasi" },
  { value: "KADIV", label: "Kepala Divisi (Kadiv)", kelompok: "Kadiv", jabatanDefault: "Kadiv" },
  { value: "STAFF_DIVISI", label: "Staff Divisi Cabang Olahraga", kelompok: "Staff Divisi", jabatanDefault: "Staff Divisi" },
];

const DIVISI_OPTIONS = ["Voli", "Futsal", "Bulutangkis", "E-Sport", "Taekwondo", "Basket"];

export default function PengurusManager({ initialData, isAdmin }: { initialData: any[]; isAdmin: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [akunBaru, setAkunBaru] = useState<{ nim: string; password: string } | null>(null);
  const editing = !!form.id;

  function handleKodeChange(kode: string) {
    const opt = KODE_JABATAN_OPTIONS.find((o) => o.value === kode)!;
    setForm({
      ...form,
      kodeJabatan: kode,
      kelompok: opt.kelompok,
        jabatan: form.jabatan && editing ? form.jabatan : opt.jabatanDefault + ((kode === "KADIV" || kode === "STAFF_DIVISI") && form.divisi ? ` ${form.divisi}` : ""),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = editing ? `/api/pengurus/${form.id}` : "/api/pengurus";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Gagal menyimpan data pengurus.");
      return;
    }
    setForm(emptyForm);
    if (data.password) setAkunBaru({ nim: data.nim, password: data.password });
    router.refresh();
  }

  async function ubahKredensial(p: any) {
    const email = prompt("Email akun", p.user?.email || "");
    if (!email) return;
    const password = prompt("Password baru (kosongkan untuk tidak mengubah password)", "");
    if (password === null) return;
    const res = await fetch(`/api/pengurus/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.message || "Gagal memperbarui kredensial.");
    alert("Kredensial berhasil diperbarui.");
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
        <h3 className="font-semibold">{editing ? "Edit Pengurus" : "Tambah Pengurus"}</h3>
        <div><label className="label">Nama</label><input required className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
        {!editing && (
          <>
            <div><label className="label">NPM/NIM untuk akun login</label><input className="input" value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} placeholder="Isi jika membuat akun" /></div>
            <div><label className="label">Email untuk akun login</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" /><p className="mt-1 text-xs text-slate-400">Isi NPM/NIM dan email untuk langsung membuat akun pengurus.</p></div>
          </>
        )}

        <div>
          <label className="label">Kode Jabatan (menentukan hak akses)</label>
          <select className="input" value={form.kodeJabatan} onChange={(e) => handleKodeChange(e.target.value)}>
            {KODE_JABATAN_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Label Jabatan (ditampilkan di halaman publik)</label>
          <input required className="input" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} placeholder="contoh: Ketua Umum" />
        </div>

        {(form.kodeJabatan === "KADIV" || form.kodeJabatan === "STAFF_DIVISI") && (
          <div>
            <label className="label">Cabang Olahraga</label>
            <select className="input" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
              <option value="">Pilih cabang olahraga</option>
              {DIVISI_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Periode Mulai</label><input required className="input" value={form.periodeMulai} onChange={(e) => setForm({ ...form, periodeMulai: e.target.value })} placeholder="2025/2026" /></div>
          <div><label className="label">Periode Akhir (opsional)</label><input className="input" value={form.periodeAkhir} onChange={(e) => setForm({ ...form, periodeAkhir: e.target.value })} placeholder="2027/2028" /></div>
        </div>
        <p className="text-xs text-slate-400 -mt-2">Pengurus dapat menjabat 2–3 periode; kosongkan Periode Akhir jika masih menjabat periode berjalan.</p>

        <div><label className="label">Urutan Tampil</label><input type="number" className="input" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} /></div>
        <ImageUploader value={form.foto} onChange={(url) => setForm({ ...form, foto: url })} label="Foto" />
        <div className="flex gap-2">
          <button disabled={loading} className="btn-primary flex-1">{loading ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}</button>
          {editing && <button type="button" onClick={() => setForm(emptyForm)} className="btn-outline flex-1">Batal</button>}
        </div>
      </form>

      <div className="md:col-span-2 card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>Nama</th><th>Jabatan</th><th>Periode</th><th>Akun</th><th>Aksi</th></tr></thead>
          <tbody>
            {initialData.map((p) => (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>{p.jabatan}{p.divisi ? ` (${p.divisi})` : ""}</td>
                <td>{p.periodeMulai}{p.periodeAkhir ? ` – ${p.periodeAkhir}` : " – sekarang"}</td>
                <td>
                  {p.userId ? <div className="flex items-center gap-2"><span className="badge bg-green-100 text-green-700">Ada</span>{isAdmin && <button onClick={() => ubahKredensial(p)} className="text-xs font-semibold text-blue-600">Kredensial</button>}</div> : <span className="badge bg-orange-100 text-orange-600">Belum</span>}
                </td>
                <td className="flex gap-2">
                  <button onClick={() => setForm({ ...emptyForm, ...p, divisi: p.divisi || "", periodeAkhir: p.periodeAkhir || "" })} className="text-xs text-blue-600 font-semibold">Edit</button>
                  <DataTableActions deleteUrl={`/api/pengurus/${p.id}`} />
                </td>
              </tr>
            ))}
            {initialData.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-6">Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>

      {akunBaru && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setAkunBaru(null)}>
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-semibold">Akun Berhasil Dibuat</h3>
            <p className="mb-1 text-sm"><b>NPM/NIM:</b> {akunBaru.nim}</p>
            <p className="mb-4 text-sm"><b>Password:</b> {akunBaru.password}</p>
            <p className="mb-4 text-xs text-slate-500">Kredensial juga dikirim ke email pengurus. Simpan informasi ini sekarang.</p>
            <button onClick={() => setAkunBaru(null)} className="btn-primary w-full">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
