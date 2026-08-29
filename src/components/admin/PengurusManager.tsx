"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import DataTableActions from "./DataTableActions";

const emptyForm = {
  id: "",
  nama: "",
  nim: "",
  noHp: "",
  jabatan: "",
  kodeJabatan: "KETUA_UMUM",
  kelompok: "Inti",
  prodi: "",
  alamat: "",
  tanggalLahir: "",
  divisi: "",
  foto: "",
  periodeMulai: "2026/2027",
  periodeAkhir: "",
  urutan: 0,
  isActive: true,
};

const KODE_JABATAN_OPTIONS = [
  { value: "DPO", label: "DPO (Dewan Pertimbangan Organisasi)", kelompok: "DPO", jabatanDefault: "Anggota DPO" },
  { value: "KETUA_UMUM", label: "Ketua Umum", kelompok: "Inti", jabatanDefault: "Ketua Umum" },
  { value: "WAKIL_KETUA", label: "Wakil Ketua Umum", kelompok: "Inti", jabatanDefault: "Wakil Ketua Umum" },
  { value: "SEKRETARIS", label: "Sekretaris", kelompok: "Inti", jabatanDefault: "Sekretaris" },
  { value: "BENDAHARA", label: "Bendahara", kelompok: "Inti", jabatanDefault: "Bendahara" },
  { value: "BIDANG_SDM", label: "Bidang SDM", kelompok: "Bidang", jabatanDefault: "Bidang SDM" },
  { value: "BIDANG_INVENTARIS", label: "Bidang Inventaris", kelompok: "Bidang", jabatanDefault: "Bidang Inventaris" },
  { value: "BIDANG_MEDIA", label: "Bidang Media Informasi", kelompok: "Bidang", jabatanDefault: "Bidang Media Informasi" },
  { value: "BIDANG_SDM_STAFF", label: "Staff Bidang SDM", kelompok: "Bidang", jabatanDefault: "Staff SDM" },
  { value: "BIDANG_INVENTARIS_STAFF", label: "Staff Bidang Inventaris", kelompok: "Bidang", jabatanDefault: "Staff Inventaris" },
  { value: "BIDANG_MEDIA_STAFF", label: "Staff Bidang Medifor", kelompok: "Bidang", jabatanDefault: "Staff Medifor" },
  { value: "KADIV", label: "Kepala Divisi (Kadiv)", kelompok: "Kadiv", jabatanDefault: "Kadiv" },
  { value: "STAFF_DIVISI", label: "Staff Divisi Cabang Olahraga", kelompok: "Staff Divisi", jabatanDefault: "Staff Divisi" },
];

const DIVISI_OPTIONS = ["Voli", "Futsal", "Bulutangkis", "E-Sport", "Taekwondo", "Basket"];

export default function PengurusManager({
  initialData,
  isAdmin,
}: {
  initialData: any[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState("");

  const [akunBaru, setAkunBaru] = useState<{ nim: string; password: string } | null>(null);
  const [editKredensial, setEditKredensial] = useState<{ id: string; nama: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Filter data berdasarkan nama, NIM, jabatan, prodi, atau divisi
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return initialData;
    const query = searchTerm.toLowerCase();
    return initialData.filter((p) => {
      return (
        p.nama?.toLowerCase().includes(query) ||
        p.nim?.toLowerCase().includes(query) ||
        p.jabatan?.toLowerCase().includes(query) ||
        p.prodi?.toLowerCase().includes(query) ||
        p.divisi?.toLowerCase().includes(query)
      );
    });
  }, [initialData, searchTerm]);

  function handleKodeChange(kode: string, isInline: boolean = false) {
    const opt = KODE_JABATAN_OPTIONS.find((o) => o.value === kode);
    if (!opt) return;

    setForm({
      ...form,
      kodeJabatan: kode,
      kelompok: opt.kelompok,
      jabatan:
        form.jabatan && isInline
          ? form.jabatan
          : opt.jabatanDefault +
            ((kode === "KADIV" || kode === "STAFF_DIVISI") && form.divisi
              ? ` ${form.divisi}`
              : ""),
    });
  }

  async function handleSubmit(e: React.FormEvent, isInline: boolean = false) {
    e.preventDefault();
    setLoading(true);

    try {
      const targetId = isInline ? editingId : form.id;
      const url = targetId ? `/api/pengurus/${targetId}` : "/api/pengurus";
      const method = targetId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal menyimpan data pengurus.");
        return;
      }

      setForm(emptyForm);
      setShowAddModal(false);
      setEditingId(null);

      if (data.password) {
        setAkunBaru({ nim: data.nim, password: data.password });
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data pengurus.");
    } finally {
      setLoading(false);
    }
  }

  function mulaiEdit(p: any) {
    setForm({
      ...emptyForm,
      ...p,
      noHp: p.noHp || "",
      divisi: p.divisi || "",
      alamat: p.alamat || "",
      prodi: p.prodi || "",
      tanggalLahir: p.tanggalLahir ? new Date(p.tanggalLahir).toISOString().slice(0, 10) : "",
      periodeAkhir: p.periodeAkhir || "",
      urutan: p.urutan ?? 0,
      isActive: p.isActive ?? true,
    });
    setEditingId(p.id);
    setShowAddModal(false);
  }

  function batalEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function ubahKredensial(p: any) {
    setEditKredensial({ id: p.id, nama: p.nama });
    setNewPassword("");
  }

  async function submitKredensial() {
    if (!editKredensial) return;
    if (!newPassword || newPassword.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    try {
      const res = await fetch(`/api/pengurus/${editKredensial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal memperbarui kredensial.");
        return;
      }

      alert("Password berhasil diperbarui.");
      setEditKredensial(null);
      setNewPassword("");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui kredensial.");
    }
  }

  const renderFormContent = (isInline: boolean) => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
          <input required className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Masukkan nama lengkap" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NPM/NIM</label>
          <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} placeholder="Contoh: 21.0504.00xx" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No HP / WhatsApp</label>
          <input type="tel" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })} placeholder="08xxxxxxxxxx" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Program Studi</label>
          <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} placeholder="Contoh: S1 Teknik Informatika" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
          <input type="date" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.tanggalLahir} onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })} />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
          <textarea className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none" rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" />
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Jabatan</label>
          <select className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.kodeJabatan} onChange={(e) => handleKodeChange(e.target.value, isInline)}>
            {KODE_JABATAN_OPTIONS.map((k) => (<option key={k.value} value={k.value}>{k.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Label Jabatan</label>
          <input required className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} placeholder="Contoh: Ketua Umum" />
        </div>
        {(form.kodeJabatan === "KADIV" || form.kodeJabatan === "STAFF_DIVISI") && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cabang Olahraga / Divisi</label>
            <select className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
              <option value="">-- Pilih Cabang Olahraga --</option>
              {DIVISI_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode Mulai</label>
          <input required className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.periodeMulai} onChange={(e) => setForm({ ...form, periodeMulai: e.target.value })} placeholder="Contoh: 2026/2027" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode Akhir</label>
          <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.periodeAkhir} onChange={(e) => setForm({ ...form, periodeAkhir: e.target.value })} placeholder="Kosongkan jika masih menjabat" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Urutan Tampil</label>
          <input type="number" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Pengurus</label>
          <select className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500" value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif (Demisioner)</option>
          </select>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />
      <ImageUploader value={form.foto} onChange={(url) => setForm({ ...form, foto: url })} label="Unggah Foto (Maks 2MB)" />
    </div>
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      
      {/* =================================================
          STICKY ACTION BAR (PENCARIAN & TOMBOL TAMBAH)
      ================================================= */}
      <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md py-2.5 px-3 border-b border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        
        {/* Kolom Input Pencarian */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 pl-9 pr-3.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
            placeholder="Cari nama, NIM, jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Menampilkan: <strong className="text-slate-800 dark:text-white">{filteredData.length}</strong> dari {initialData.length} Pengurus
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Pengurus
          </button>
        </div>
      </div>

      {/* =================================================
          MODAL TAMBAH PENGURUS BARU
      ================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex-none flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tambah Pengurus Baru</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi formulir di bawah ini dengan data yang benar.</p>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form id="pengurus-add-form" onSubmit={(e) => handleSubmit(e, false)}>
                {renderFormContent(false)}
              </form>
            </div>

            <div className="flex-none border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Batal</button>
              <button form="pengurus-add-form" type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? "Menyimpan..." : "Tambah Pengurus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          TABEL UTAMA
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
            <thead className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 sticky top-0 z-30 shadow-sm">
              <tr>
                <th className="px-5 py-3.5 font-semibold border-b border-slate-200 dark:border-slate-700">Nama & Info (NIM, TTL)</th>
                <th className="px-5 py-3.5 font-semibold border-b border-slate-200 dark:border-slate-700">Kontak & Studi (HP, Prodi)</th>
                <th className="px-5 py-3.5 font-semibold border-b border-slate-200 dark:border-slate-700">Jabatan & Divisi</th>
                <th className="px-5 py-3.5 font-semibold border-b border-slate-200 dark:border-slate-700">Alamat</th>
                <th className="px-5 py-3.5 font-semibold border-b border-slate-200 dark:border-slate-700">Periode</th>
                <th className="px-5 py-3.5 font-semibold border-b border-slate-200 dark:border-slate-700">Status & Akun</th>
                <th className="px-5 py-3.5 font-semibold text-right border-b border-slate-200 dark:border-slate-700">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredData.map((p) => {
                const isEditing = editingId === p.id;

                return (
                  <>
                    <tr key={p.id} className={`transition duration-150 ${isEditing ? "bg-blue-50/40 dark:bg-slate-900/40 border-l-4 border-blue-600" : "hover:bg-slate-50/70 dark:hover:bg-slate-700/50"}`}>
                      
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{p.nama || "-"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          NIM: <span className="font-mono">{p.nim || "-"}</span> | Lahir: {p.tanggalLahir ? new Date(p.tanggalLahir).toLocaleDateString("id-ID") : "-"}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{p.noHp || "-"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.prodi || "-"}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{p.jabatan || "-"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.divisi ? `Divisi ${p.divisi}` : p.kelompok || "-"}</div>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs truncate" title={p.alamat}>
                        <div className="text-sm text-slate-700 dark:text-slate-300 truncate">{p.alamat || "-"}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {p.periodeMulai || "-"} {p.periodeAkhir ? ` – ${p.periodeAkhir}` : " – sekarang"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                          }`}>
                            {p.isActive ? "Aktif" : "Non-Aktif"}
                          </span>
                          
                          {p.userId ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-medium">Akun Ada</span>
                              {isAdmin && <button onClick={() => ubahKredensial(p)} className="text-blue-600 dark:text-blue-400 hover:underline text-[11px]">Reset</button>}
                            </div>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 px-1.5 py-0.5 rounded text-[10px] font-medium">Belum Ada Akun</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => mulaiEdit(p)} className={`p-1.5 rounded-lg transition ${isEditing ? "bg-blue-600 text-white" : "text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"}`} title="Edit Pengurus">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <DataTableActions deleteUrl={`/api/pengurus/${p.id}`} />
                        </div>
                      </td>

                    </tr>

                    {/* FORM EDIT MUNCUL PAS DI BAWAH BARIS YANG DIKLIK */}
                    {isEditing && (
                      <tr key={`edit-${p.id}`} className="bg-slate-50/90 dark:bg-slate-900/90 border-b-2 border-blue-500">
                        <td colSpan={7} className="p-6 whitespace-normal">
                          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4 border-b pb-3 dark:border-slate-700">
                              <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                Edit Data: <span className="text-blue-600">{p.nama}</span>
                              </h4>
                              <button type="button" onClick={batalEdit} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold">Tutup [X]</button>
                            </div>

                            <form onSubmit={(e) => handleSubmit(e, true)}>
                              {renderFormContent(true)}

                              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                                <button type="button" onClick={batalEdit} className="rounded-xl px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Batal</button>
                                <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition">
                                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    {initialData.length === 0 ? "Belum ada data pengurus." : "Tidak ditemukan data pengurus yang sesuai dengan kata kunci."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AKUN & KREDENSIAL */}
      {akunBaru && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAkunBaru(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">Akun Berhasil Dibuat</h3>
            <p className="mb-2 text-sm text-slate-700 dark:text-slate-300"><b>NPM:</b> {akunBaru.nim}</p>
            <p className="mb-4 text-sm text-slate-700 dark:text-slate-300"><b>Password:</b> {akunBaru.password}</p>
            <button onClick={() => setAkunBaru(null)} className="w-full rounded-xl bg-slate-900 dark:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Tutup</button>
          </div>
        </div>
      )}

      {editKredensial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditKredensial(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Ubah Password</h3>
            <input type="text" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-4" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setEditKredensial(null)} className="flex-1 rounded-xl border px-4 py-2 text-sm text-slate-600 dark:text-slate-300">Batal</button>
              <button onClick={submitKredensial} className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}