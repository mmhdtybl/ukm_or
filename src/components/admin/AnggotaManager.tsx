"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTableActions from "./DataTableActions";
import ExportCsvButton from "./ExportCsvButton";
import { FiEdit2, FiKey, FiPlus } from "react-icons/fi";
import { DIVISI_OPTIONS } from "@/lib/divisi";

const CSV_HEADERS_ANGGOTA = ["Nama", "NIM", "No HP", "Prodi", "Jabatan", "Alamat", "Tanggal Lahir", "Divisi", "Periode", "Status", "Akun"];

function rowsAnggota(list: any[]) {
  return list.map((a) => [
    a.nama || "",
    a.nim || "",
    a.noHp || "",
    a.prodi || "",
    a.jabatan || "",
    a.alamat || "",
    a.tanggalLahir ? new Date(a.tanggalLahir).toLocaleDateString("id-ID") : "",
    a.divisi || "",
    a.periode || "",
    a.status || "",
    a.userId ? "Ada" : "Belum",
  ]);
}

const emptyForm = {
  id: "",
  nama: "",
  nim: "",
  prodi: "",
  angkatan: "",
  noHp: "",
  alamat: "",
  tanggalLahir: "",
  divisi: "",
  jabatan: "",
  periode: "2025/2026",
  status: "Aktif",
};

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

  const [form, setForm] = useState({
    ...emptyForm,
    divisi: divisiLock || "",
  });

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [akunModal, setAkunModal] = useState<{
    nim: string;
    password: string;
  } | null>(null);

  const [buatAkunModal, setBuatAkunModal] = useState<{
    id: string;
    nim: string;
  } | null>(null);
  const [buatAkunPassword, setBuatAkunPassword] = useState("");

  const [editKredensialModal, setEditKredensialModal] = useState<{
    id: string;
    nama: string;
  } | null>(null);
  const [editKredensialPassword, setEditKredensialPassword] = useState("");

  const editing = Boolean(form.id);

  // =========================================================
  // SIMPAN / EDIT ANGGOTA
  // =========================================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(
        editing ? `/api/anggota/${form.id}` : "/api/anggota",
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal menyimpan data anggota.");
        return;
      }

      setForm({
        ...emptyForm,
        divisi: divisiLock || "",
      });

      setShowForm(false);

      if (data.password) {
        setAkunModal({
          nim: data.nim,
          password: data.password,
        });
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data anggota.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // MULAI EDIT
  // =========================================================

  function mulaiEdit(anggota: any) {
    setForm({
      id: anggota.id,
      nama: anggota.nama || "",
      nim: anggota.nim || "",
      prodi: anggota.prodi || "",
      angkatan: anggota.angkatan || "",
      noHp: anggota.noHp || "",
      alamat: anggota.alamat || "",
      tanggalLahir: anggota.tanggalLahir
        ? new Date(anggota.tanggalLahir)
            .toISOString()
            .slice(0, 10)
        : "",
      divisi: divisiLock || anggota.divisi || "",
      jabatan: anggota.jabatan || "",
      periode: anggota.periode || "",
      status: anggota.status || "Aktif",
    });

    setShowForm(true);
  }

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  async function updateStatus(
    id: string,
    status: string,
    current: any
  ) {
    try {
      const res = await fetch(`/api/anggota/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...current,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal memperbarui status.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  }

  // =========================================================
  // BUAT AKUN
  // =========================================================

  function buatAkun(id: string, nim: string) {
    setBuatAkunModal({ id, nim });
    setBuatAkunPassword("");
  }

  async function submitBuatAkun() {
    if (!buatAkunModal) return;
    if (!buatAkunPassword || buatAkunPassword.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    try {
      const res = await fetch(`/api/anggota/${buatAkunModal.id}/akun`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: buatAkunPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal membuat akun.");
        return;
      }

      setAkunModal({
        nim: data.nim,
        password: data.password,
      });
      setBuatAkunModal(null);
      setBuatAkunPassword("");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat akun.");
    }
  }

  // =========================================================
  // KELOLA AKUN
  // =========================================================

  async function kelolaAkun(
    id: string,
    aksi: "ubah" | "hapus"
  ) {
    // HAPUS AKUN — tetap pakai confirm karena ini destructive action
    if (aksi === "hapus") {
      if (
        !confirm(
          "Hapus akun login anggota ini?\n\nData anggota tetap tersimpan."
        )
      ) {
        return;
      }

      try {
        const res = await fetch(`/api/anggota/${id}/akun`, {
          method: "DELETE",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert(data.message || "Gagal menghapus akun.");
          return;
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat menghapus akun.");
      }

      return;
    }

    // UBAH PASSWORD — buka modal
    const anggotaData = initialData.find((a) => a.id === id);
    setEditKredensialModal({ id, nama: anggotaData?.nama || "" });
    setEditKredensialPassword("");
  }

  async function submitEditKredensial() {
    if (!editKredensialModal) return;
    if (!editKredensialPassword || editKredensialPassword.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    try {
      const res = await fetch(`/api/anggota/${editKredensialModal.id}/akun`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: editKredensialPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal memperbarui akun.");
        return;
      }

      alert("Password akun berhasil diperbarui.");
      setEditKredensialModal(null);
      setEditKredensialPassword("");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui akun.");
    }
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filtered = initialData.filter((a) => {
    const keyword = q.toLowerCase();

    return (
      (a.nama || "")
        .toLowerCase()
        .includes(keyword) ||
      (a.nim || "")
        .toLowerCase()
        .includes(keyword) ||
      (a.noHp || "")
        .toLowerCase()
        .includes(keyword) ||
      (a.prodi || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>

      {/* =====================================================
          SEARCH + TAMBAH
      ===================================================== */}

      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:items-center sm:justify-between">

        <input
          placeholder="Cari nama/NIM/No HP/Prodi..."
          className="input max-w-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <button
              onClick={() => {
                setForm({
                  ...emptyForm,
                  divisi: divisiLock || "",
                });

                setShowForm(!showForm);
              }}
              className="btn-primary !py-2 !px-4 text-sm w-fit flex items-center gap-2"
            >
              <FiPlus />
              Tambah Anggota
            </button>
          )}
          <ExportCsvButton
            filename="data-anggota.csv"
            headers={CSV_HEADERS_ANGGOTA}
            rows={rowsAnggota(filtered)}
          />
        </div>
      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT ANGGOTA
      ===================================================== */}

      {showForm && !readOnly && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            setForm({ ...emptyForm, divisi: divisiLock || "" });
            setShowForm(false);
          }}
        >
          <div
            className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-semibold text-lg">
                {editing ? "Edit Anggota" : "Tambah Anggota"}
              </h2>

              {/* NAMA + NIM */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama</label>
                  <input
                    required
                    className="input"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">NIM</label>
                  <input
                    required
                    className="input"
                    value={form.nim}
                    onChange={(e) => setForm({ ...form, nim: e.target.value })}
                  />
                  {editing && (
                    <p className="mt-1 text-xs text-slate-400">
                      NIM akun login akan ikut diperbarui.
                    </p>
                  )}
                </div>
              </div>

              {/* NO HP + PRODI */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">No. HP / WhatsApp</label>
                  <input
                    className="input"
                    value={form.noHp}
                    onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Prodi</label>
                  <input
                    required
                    className="input"
                    value={form.prodi}
                    onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                  />
                </div>
              </div>

              {/* ANGKATAN + JABATAN */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Angkatan</label>
                  <input
                    required
                    className="input"
                    value={form.angkatan}
                    onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Jabatan</label>
                  <input
                    className="input"
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="Contoh: Anggota"
                  />
                </div>
              </div>

              {/* TANGGAL LAHIR + DIVISI */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal Lahir</label>
                  <input
                    type="date"
                    className="input"
                    value={form.tanggalLahir}
                    onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Divisi</label>
                  {divisiLock ? (
                    <input
                      disabled
                      className="input bg-slate-100 dark:bg-white/5"
                      value={divisiLock}
                    />
                  ) : (
                    <select
                      required
                      className="input"
                      value={form.divisi}
                      onChange={(e) => setForm({ ...form, divisi: e.target.value })}
                    >
                      <option value="">Pilih divisi</option>
                      {DIVISI_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* ALAMAT */}
              <div>
                <label className="label">Alamat</label>
                <textarea
                  rows={2}
                  className="input"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
              </div>

              {/* PERIODE + STATUS */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Periode Keanggotaan</label>
                  <input
                    className="input"
                    value={form.periode}
                    onChange={(e) => setForm({ ...form, periode: e.target.value })}
                    placeholder="2025/2026"
                  />
                </div>

                {editing && (
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 pt-2">
                <button disabled={loading} className="btn-primary flex-1">
                  {loading
                    ? "Menyimpan..."
                    : editing
                    ? "Simpan Perubahan"
                    : "Simpan Anggota"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...emptyForm, divisi: divisiLock || "" });
                    setShowForm(false);
                  }}
                  className="btn-outline flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          TABEL ANGGOTA
      ===================================================== */}

      <div className="card overflow-x-auto">

        <table className="table-admin">

          <thead>
            <tr>
              <th>Nama</th>
              <th>NIM</th>
              <th>No HP</th>
              <th>Prodi</th>
              <th>Jabatan</th>
              <th>Alamat</th>
              <th>Tanggal Lahir</th>
              <th>Divisi</th>
              <th>Periode</th>
              <th>Status</th>
              <th>Akun</th>

              {!readOnly && (
                <th>Aksi</th>
              )}
            </tr>
          </thead>

          <tbody>

            {filtered.map((a) => {

              return (
                <tr key={a.id}>

                  {/* NAMA */}
                  <td className="font-medium whitespace-nowrap">
                    {a.nama || "-"}
                  </td>

                  {/* NIM */}
                  <td className="whitespace-nowrap">
                    {a.nim || "-"}
                  </td>

                  {/* NO HP */}
                  <td className="whitespace-nowrap">
                    {a.noHp || "-"}
                  </td>

                  {/* PRODI */}
                  <td>
                    {a.prodi || "-"}
                  </td>

                  {/* JABATAN */}
                  <td>
                    {a.jabatan || "-"}
                  </td>

                  {/* ALAMAT */}
                  <td className="max-w-56 whitespace-normal">
                    {a.alamat || "-"}
                  </td>

                  {/* TANGGAL LAHIR */}
                  <td className="whitespace-nowrap">
                    {a.tanggalLahir
                      ? new Date(
                          a.tanggalLahir
                        ).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </td>

                  {/* DIVISI */}
                  <td className="whitespace-nowrap">
                    {a.divisi || "-"}
                  </td>

                  {/* PERIODE */}
                  <td className="whitespace-nowrap">
                    {a.periode || "-"}
                  </td>

                  {/* STATUS */}
                  <td>

                    {readOnly ? (
                      <span
                        className={`badge ${
                          a.status === "Aktif"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Alumni"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.status || "-"}
                      </span>
                    ) : (
                      <select
                        value={
                          a.status || "Aktif"
                        }
                        onChange={(e) =>
                          updateStatus(
                            a.id,
                            e.target.value,
                            a
                          )
                        }
                        className="input !py-1 !px-2 text-xs min-w-[110px]"
                      >
                        <option value="Aktif">
                          Aktif
                        </option>

                        <option value="Non-Aktif">
                          Non-Aktif
                        </option>

                        <option value="Alumni">
                          Alumni
                        </option>
                      </select>
                    )}

                  </td>

                  {/* AKUN */}
                  <td>

                    {a.userId ? (

                      <div className="flex flex-col gap-1">

                        <span className="badge bg-green-100 text-green-700 w-fit">
                          Ada
                        </span>

                        {isAdmin && (
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                kelolaAkun(
                                  a.id,
                                  "ubah"
                                )
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                            >
                              <FiKey size={12} />
                              Kredensial
                            </button>

                            <button
                              onClick={() =>
                                kelolaAkun(
                                  a.id,
                                  "hapus"
                                )
                              }
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Hapus
                            </button>

                          </div>
                        )}

                      </div>

                    ) : readOnly ? (

                      <span className="badge bg-orange-100 text-orange-600">
                        Belum
                      </span>

                    ) : (

                      <button
                        type="button"
                        onClick={() =>
                          buatAkun(a.id, a.nim)
                        }
                        title="Buat akun"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <FiKey size={12} />
                        Buat Akun
                      </button>

                    )}

                  </td>

                  {/* AKSI */}
                  {!readOnly && (
                    <td>

                      <div className="flex gap-2 items-center whitespace-nowrap">

                        <button
                          type="button"
                          onClick={() =>
                            mulaiEdit(a)
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          <FiEdit2 size={13} />
                          Edit
                        </button>

                        <DataTableActions
                          deleteUrl={`/api/anggota/${a.id}`}
                        />

                      </div>

                    </td>
                  )}

                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={readOnly ? 11 : 12}
                  className="text-center text-slate-400 py-6"
                >
                  Tidak ada data anggota.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          MODAL AKUN
      ===================================================== */}

      {akunModal && (

        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-items-center p-4"
          onClick={() =>
            setAkunModal(null)
          }
        >

          <div
            className="card max-w-sm w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="font-semibold text-lg mb-3">
              Akun Berhasil Dibuat
            </h3>

            <p className="text-sm mb-1">
              <b>NPM/NIM:</b>{" "}
              {akunModal.nim}
            </p>

            <p className="text-sm mb-4">
              <b>Password:</b>{" "}
              {akunModal.password}
            </p>

            <p className="text-xs text-slate-500 mb-4">
              Simpan/salin sekarang,
              karena password tidak akan
              ditampilkan lagi.
            </p>

            <button
              onClick={() =>
                setAkunModal(null)
              }
              className="btn-primary w-full"
            >
              Tutup
            </button>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL BUAT AKUN
      ===================================================== */}

      {buatAkunModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            setBuatAkunModal(null);
            setBuatAkunPassword("");
          }}
        >
          <div
            className="card w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold">Buat Akun Anggota</h3>
            <p className="mb-4 text-sm text-slate-500">NIM: {buatAkunModal.nim}</p>

            <div className="mb-4">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={buatAkunPassword}
                onChange={(e) => setBuatAkunPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitBuatAkun();
                }}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={submitBuatAkun} className="btn-primary flex-1">
                Buat Akun
              </button>
              <button
                onClick={() => {
                  setBuatAkunModal(null);
                  setBuatAkunPassword("");
                }}
                className="btn-outline flex-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL UBAH KREDENSIAL ANGGOTA
      ===================================================== */}

      {editKredensialModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            setEditKredensialModal(null);
            setEditKredensialPassword("");
          }}
        >
          <div
            className="card w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold">Ubah Password</h3>
            <p className="mb-4 text-sm text-slate-500">{editKredensialModal.nama}</p>

            <div className="mb-4">
              <label className="label">Password baru</label>
              <input
                type="password"
                className="input"
                value={editKredensialPassword}
                onChange={(e) => setEditKredensialPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitEditKredensial();
                }}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={submitEditKredensial} className="btn-primary flex-1">
                Simpan
              </button>
              <button
                onClick={() => {
                  setEditKredensialModal(null);
                  setEditKredensialPassword("");
                }}
                className="btn-outline flex-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}