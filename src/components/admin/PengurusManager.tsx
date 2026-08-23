"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import DataTableActions from "./DataTableActions";

const emptyForm = {
  id: "",
  nama: "",
  nim: "",
  noHp: "",
  email: "",
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

// Setiap kode jabatan sudah punya kelompok & label default
// agar konsisten dengan hak akses di lib/permissions.ts
const KODE_JABATAN_OPTIONS = [
  {
    value: "DPO",
    label: "DPO (Dewan Pertimbangan Organisasi)",
    kelompok: "DPO",
    jabatanDefault: "Anggota DPO",
  },
  {
    value: "KETUA_UMUM",
    label: "Ketua Umum",
    kelompok: "Inti",
    jabatanDefault: "Ketua Umum",
  },
  {
    value: "WAKIL_KETUA",
    label: "Wakil Ketua Umum",
    kelompok: "Inti",
    jabatanDefault: "Wakil Ketua Umum",
  },
  {
    value: "SEKRETARIS",
    label: "Sekretaris",
    kelompok: "Inti",
    jabatanDefault: "Sekretaris",
  },
  {
    value: "BENDAHARA",
    label: "Bendahara",
    kelompok: "Inti",
    jabatanDefault: "Bendahara",
  },
  {
    value: "BIDANG_SDM",
    label: "Bidang SDM",
    kelompok: "Bidang",
    jabatanDefault: "Bidang SDM",
  },
  {
    value: "BIDANG_INVENTARIS",
    label: "Bidang Inventaris",
    kelompok: "Bidang",
    jabatanDefault: "Bidang Inventaris",
  },
  {
    value: "BIDANG_MEDIA",
    label: "Bidang Media Informasi",
    kelompok: "Bidang",
    jabatanDefault: "Bidang Media Informasi",
  },
  {
    value: "BIDANG_SDM_STAFF",
    label: "Staff Bidang SDM",
    kelompok: "Bidang",
    jabatanDefault: "Staff SDM",
  },
  {
    value: "BIDANG_INVENTARIS_STAFF",
    label: "Staff Bidang Inventaris",
    kelompok: "Bidang",
    jabatanDefault: "Staff Inventaris",
  },
  {
    value: "BIDANG_MEDIA_STAFF",
    label: "Staff Bidang Medifor",
    kelompok: "Bidang",
    jabatanDefault: "Staff Medifor",
  },
  {
    value: "KADIV",
    label: "Kepala Divisi (Kadiv)",
    kelompok: "Kadiv",
    jabatanDefault: "Kadiv",
  },
  {
    value: "STAFF_DIVISI",
    label: "Staff Divisi Cabang Olahraga",
    kelompok: "Staff Divisi",
    jabatanDefault: "Staff Divisi",
  },
];

const DIVISI_OPTIONS = [
  "Voli",
  "Futsal",
  "Bulutangkis",
  "E-Sport",
  "Taekwondo",
  "Basket",
];

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

  const [akunBaru, setAkunBaru] = useState<{
    nim: string;
    password: string;
  } | null>(null);

  const editing = !!form.id;

  // =====================================================
  // PERUBAHAN KODE JABATAN
  // =====================================================
  function handleKodeChange(kode: string) {
    const opt = KODE_JABATAN_OPTIONS.find(
      (o) => o.value === kode
    );

    if (!opt) return;

    setForm({
      ...form,
      kodeJabatan: kode,
      kelompok: opt.kelompok,

      jabatan:
        form.jabatan && editing
          ? form.jabatan
          : opt.jabatanDefault +
            ((kode === "KADIV" ||
              kode === "STAFF_DIVISI") &&
            form.divisi
              ? ` ${form.divisi}`
              : ""),
    });
  }

  // =====================================================
  // SIMPAN PENGURUS
  // =====================================================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const url = editing
        ? `/api/pengurus/${form.id}`
        : "/api/pengurus";

      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(
          data.message ||
            "Gagal menyimpan data pengurus."
        );
        return;
      }

      setForm(emptyForm);

      // Jika akun baru berhasil dibuat
      if (data.password) {
        setAkunBaru({
          nim: data.nim,
          password: data.password,
        });
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan saat menyimpan data pengurus."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // UBAH KREDENSIAL
  // =====================================================
  async function ubahKredensial(p: any) {
    const email = prompt(
      "Email akun",
      p.user?.email || p.email || ""
    );

    if (!email) return;

    const password = prompt(
      "Password baru (kosongkan untuk tidak mengubah password)",
      ""
    );

    if (password === null) return;

    try {
      const res = await fetch(
        `/api/pengurus/${p.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(
          data.message ||
            "Gagal memperbarui kredensial."
        );
        return;
      }

      alert("Kredensial berhasil diperbarui.");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan saat memperbarui kredensial."
      );
    }
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="grid md:grid-cols-3 gap-6">

      {/* =================================================
          FORM PENGURUS
      ================================================= */}
      <form
        onSubmit={handleSubmit}
        className="card space-y-4 h-fit"
      >
        <h3 className="font-semibold">
          {editing
            ? "Edit Pengurus"
            : "Tambah Pengurus"}
        </h3>

        {/* NAMA */}
        <div>
          <label className="label">
            Nama
          </label>

          <input
            required
            className="input"
            value={form.nama}
            onChange={(e) =>
              setForm({
                ...form,
                nama: e.target.value,
              })
            }
          />
        </div>

        {/* NIM + NO HP */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="label">
              NPM/NIM
            </label>

            <input
              className="input"
              value={form.nim}
              onChange={(e) =>
                setForm({
                  ...form,
                  nim: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="label">
              No HP / WhatsApp
            </label>

            <input
              type="tel"
              className="input"
              value={form.noHp}
              onChange={(e) =>
                setForm({
                  ...form,
                  noHp: e.target.value,
                })
              }
              placeholder="08xxxxxxxxxx"
            />
          </div>

        </div>

        {/* PROGRAM STUDI */}
        <div>
          <label className="label">
            Program Studi
          </label>

          <input
            className="input"
            value={form.prodi}
            onChange={(e) =>
              setForm({
                ...form,
                prodi: e.target.value,
              })
            }
          />
        </div>

        {/* ALAMAT */}
        <div>
          <label className="label">
            Alamat
          </label>

          <textarea
            className="input"
            rows={2}
            value={form.alamat}
            onChange={(e) =>
              setForm({
                ...form,
                alamat: e.target.value,
              })
            }
          />
        </div>

        {/* TANGGAL LAHIR */}
        <div>
          <label className="label">
            Tanggal Lahir
          </label>

          <input
            type="date"
            className="input"
            value={form.tanggalLahir}
            onChange={(e) =>
              setForm({
                ...form,
                tanggalLahir: e.target.value,
              })
            }
          />
        </div>

        {/* EMAIL */}
        {!editing && (
          <div>
            <label className="label">
              Email untuk akun login
            </label>

            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="nama@email.com"
            />

            <p className="mt-1 text-xs text-slate-400">
              Isi NPM/NIM dan email untuk
              langsung membuat akun pengurus.
            </p>
          </div>
        )}

        {/* KODE JABATAN */}
        <div>
          <label className="label">
            Kode Jabatan (menentukan hak akses)
          </label>

          <select
            className="input"
            value={form.kodeJabatan}
            onChange={(e) =>
              handleKodeChange(e.target.value)
            }
          >
            {KODE_JABATAN_OPTIONS.map((k) => (
              <option
                key={k.value}
                value={k.value}
              >
                {k.label}
              </option>
            ))}
          </select>
        </div>

        {/* LABEL JABATAN */}
        <div>
          <label className="label">
            Label Jabatan
          </label>

          <input
            required
            className="input"
            value={form.jabatan}
            onChange={(e) =>
              setForm({
                ...form,
                jabatan: e.target.value,
              })
            }
            placeholder="Contoh: Ketua Umum"
          />
        </div>

        {/* DIVISI */}
        {(form.kodeJabatan === "KADIV" ||
          form.kodeJabatan === "STAFF_DIVISI") && (
          <div>
            <label className="label">
              Cabang Olahraga
            </label>

            <select
              className="input"
              value={form.divisi}
              onChange={(e) =>
                setForm({
                  ...form,
                  divisi: e.target.value,
                })
              }
            >
              <option value="">
                Pilih cabang olahraga
              </option>

              {DIVISI_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PERIODE */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="label">
              Periode Mulai
            </label>

            <input
              required
              className="input"
              value={form.periodeMulai}
              onChange={(e) =>
                setForm({
                  ...form,
                  periodeMulai: e.target.value,
                })
              }
              placeholder="2026/2027"
            />
          </div>

          <div>
            <label className="label">
              Periode Akhir
            </label>

            <input
              className="input"
              value={form.periodeAkhir}
              onChange={(e) =>
                setForm({
                  ...form,
                  periodeAkhir: e.target.value,
                })
              }
              placeholder="2027/2028"
            />
          </div>

        </div>

        <p className="text-xs text-slate-400 -mt-2">
          Pengurus dapat menjabat 2–3 periode.
          Kosongkan Periode Akhir jika masih
          menjabat periode berjalan.
        </p>

        {/* URUTAN */}
        <div>
          <label className="label">
            Urutan Tampil
          </label>

          <input
            type="number"
            className="input"
            value={form.urutan}
            onChange={(e) =>
              setForm({
                ...form,
                urutan: Number(e.target.value),
              })
            }
          />
        </div>

        {/* STATUS */}
        <div>
          <label className="label">
            Status
          </label>

          <select
            className="input"
            value={form.isActive ? "true" : "false"}
            onChange={(e) =>
              setForm({
                ...form,
                isActive: e.target.value === "true",
              })
            }
          >
            <option value="true">
              Aktif
            </option>

            <option value="false">
              Tidak Aktif
            </option>
          </select>
        </div>

        {/* FOTO */}
        <ImageUploader
          value={form.foto}
          onChange={(url) =>
            setForm({
              ...form,
              foto: url,
            })
          }
          label="Foto"
        />

        {/* BUTTON */}
        <div className="flex gap-2">

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading
              ? "Menyimpan..."
              : editing
              ? "Simpan"
              : "Tambah"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={() =>
                setForm(emptyForm)
              }
              className="btn-outline flex-1"
            >
              Batal
            </button>
          )}

        </div>
      </form>

      {/* =================================================
          SATU TABEL DATA PENGURUS
      ================================================= */}
      <div className="md:col-span-2 card overflow-x-auto">

        <table className="table-admin">

          <thead>
            <tr>
              <th>Nama</th>
              <th>NIM</th>
              <th>No HP</th>
              <th>Email</th>
              <th>Prodi</th>
              <th>Jabatan</th>
              <th>Alamat</th>
              <th>Tanggal Lahir</th>
              <th>Divisi</th>
              <th>Periode</th>
              <th>Status</th>
              <th>Akun</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {initialData.map((p) => (

              <tr key={p.id}>

                {/* NAMA */}
                <td className="font-medium whitespace-nowrap">
                  {p.nama || "-"}
                </td>

                {/* NIM */}
                <td className="whitespace-nowrap">
                  {p.nim || "-"}
                </td>

                {/* NO HP */}
                <td className="whitespace-nowrap">
                  {p.noHp || "-"}
                </td>

                {/* EMAIL */}
                <td className="whitespace-nowrap">
                  {p.user?.email ||
                    p.email ||
                    "-"}
                </td>

                {/* PRODI */}
                <td>
                  {p.prodi || "-"}
                </td>

                {/* JABATAN */}
                <td className="min-w-40">
                  {p.jabatan || "-"}
                </td>

                {/* ALAMAT */}
                <td className="max-w-48 whitespace-normal">
                  {p.alamat || "-"}
                </td>

                {/* TANGGAL LAHIR */}
                <td className="whitespace-nowrap">
                  {p.tanggalLahir
                    ? new Date(
                        p.tanggalLahir
                      ).toLocaleDateString(
                        "id-ID"
                      )
                    : "-"}
                </td>

                {/* DIVISI */}
                <td>
                  {p.divisi || "-"}
                </td>

                {/* PERIODE */}
                <td className="whitespace-nowrap">
                  {p.periodeMulai || "-"}

                  {p.periodeAkhir
                    ? ` – ${p.periodeAkhir}`
                    : " – sekarang"}
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={`badge ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.isActive
                      ? "Aktif"
                      : "Tidak Aktif"}
                  </span>
                </td>

                {/* AKUN */}
                <td>
                  {p.userId ? (

                    <div className="flex flex-col gap-1">

                      <span className="badge bg-green-100 text-green-700">
                        Ada
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() =>
                            ubahKredensial(p)
                          }
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Kredensial
                        </button>
                      )}

                    </div>

                  ) : (

                    <span className="badge bg-orange-100 text-orange-600">
                      Belum
                    </span>

                  )}
                </td>

                {/* AKSI */}
                <td>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        setForm({
                          ...emptyForm,
                          ...p,

                          noHp:
                            p.noHp || "",

                          email:
                            p.user?.email ||
                            p.email ||
                            "",

                          divisi:
                            p.divisi || "",

                          alamat:
                            p.alamat || "",

                          prodi:
                            p.prodi || "",

                          tanggalLahir:
                            p.tanggalLahir
                              ? new Date(
                                  p.tanggalLahir
                                )
                                  .toISOString()
                                  .slice(
                                    0,
                                    10
                                  )
                              : "",

                          periodeAkhir:
                            p.periodeAkhir ||
                            "",

                          urutan:
                            p.urutan ?? 0,

                          isActive:
                            p.isActive ??
                            true,
                        })
                      }
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Edit
                    </button>

                    <DataTableActions
                      deleteUrl={`/api/pengurus/${p.id}`}
                    />

                  </div>

                </td>

              </tr>

            ))}

            {initialData.length === 0 && (

              <tr>

                <td
                  colSpan={13}
                  className="text-center text-slate-400 py-6"
                >
                  Belum ada data.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          MODAL AKUN BARU
      ================================================= */}
      {akunBaru && (

        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setAkunBaru(null)
          }
        >

          <div
            className="card w-full max-w-sm"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="mb-3 text-lg font-semibold">
              Akun Berhasil Dibuat
            </h3>

            <p className="mb-1 text-sm">
              <b>NPM/NIM:</b>{" "}
              {akunBaru.nim}
            </p>

            <p className="mb-4 text-sm">
              <b>Password:</b>{" "}
              {akunBaru.password}
            </p>

            <p className="mb-4 text-xs text-slate-500">
              Kredensial juga dikirim ke email
              pengurus. Simpan informasi ini
              sekarang.
            </p>

            <button
              onClick={() =>
                setAkunBaru(null)
              }
              className="btn-primary w-full"
            >
              Tutup
            </button>

          </div>

        </div>

      )}

    </div>
  );
}