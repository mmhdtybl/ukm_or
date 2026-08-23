"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";

const statusColor: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-600",
  LULUS: "bg-green-100 text-green-700",
  TIDAK_LULUS: "bg-red-100 text-red-600",
};

const tahapLabel: Record<string, string> = {
  PRADIKSAR: "Pradiksar 1 & 2",
  DIKSAR: "Diksar",
  SELESAI: "Selesai",
};

const tahapColor: Record<string, string> = {
  PRADIKSAR: "bg-blue-100 text-blue-700",
  DIKSAR: "bg-yellow-100 text-yellow-700",
  SELESAI: "bg-green-100 text-green-700",
};

export default function PendaftaranManager({
  initialData,
  initialLinks,
  initialGoogleRequests,
}: {
  initialData: any[];
  initialLinks: any[];
  initialGoogleRequests: any[];
}) {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("PENDING");
  const [detail, setDetail] = useState<any>(null);
  const [links, setLinks] = useState<Record<string, string>>(() => {
    const savedLinks = Object.fromEntries(initialLinks.map((item) => [item.tahap, item.link]));
    // Tampilkan link Pradiksar lama di input baru sampai migration diterapkan.
    if (!savedLinks.PRADIKSAR && savedLinks.PRADIKSAR_1) savedLinks.PRADIKSAR = savedLinks.PRADIKSAR_1;
    return savedLinks;
  });
  const [savingLinks, setSavingLinks] = useState(false);
  const [googleRequests, setGoogleRequests] = useState(initialGoogleRequests);
  const [googleLoadingId, setGoogleLoadingId] = useState<string | null>(null);

  async function markGoogleRequestProcessed(id: string) {
    setGoogleLoadingId(id);
    try {
      const response = await fetch(`/api/pendaftaran/google/${id}`, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal memperbarui permintaan Google.");
      setGoogleRequests((items) => items.map((item) => item.id === id ? { ...item, status: "SELESAI" } : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memperbarui permintaan Google.");
    } finally {
      setGoogleLoadingId(null);
    }
  }

  async function saveLinks() {
    setSavingLinks(true);
    try {
      const response = await fetch("/api/pendaftaran/whatsapp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan link WhatsApp.");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan link WhatsApp.");
    } finally {
      setSavingLinks(false);
    }
  }

  async function handleAction(
    id: string,
    status: "LULUS" | "TIDAK_LULUS",
    noHp: string,
    nama: string,
    tahap: string
  ) {
    const isLulus = status === "LULUS";

    const tujuan = noHp;

    const konfirmasi = window.confirm(
      `${isLulus ? "LULUSKAN" : "TIDAK LULUSKAN"} pendaftar ini?\n\n` +
        `Nama: ${nama}\n` +
        `WhatsApp tujuan: ${tujuan}\n` +
        `Tahap: ${tahapLabel[tahap] || tahap}\n\n` +
        `${
          isLulus
            ? tahap === "PRADIKSAR"
              ? "Pendaftar akan lanjut ke Diksar dan menerima link grup Diksar."
              : "Pendaftar akan dinyatakan lulus dan menerima link WhatsApp."
            : "Notifikasi tidak lulus akan dikirim melalui WhatsApp."
        }`
    );

    if (!konfirmasi) return;

    try {
      setLoadingId(id);

      const res = await fetch(`/api/pendaftaran/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal memproses pendaftaran.");
        return;
      }

      alert(
        data.whatsappTerkirim
          ? `Berhasil diproses.\n\nWhatsApp dikirim ke:\n${data.whatsappTujuan}`
          : `Status berhasil diubah, tetapi WhatsApp gagal dikirim ke:\n${data.whatsappTujuan}`
      );

      setDetail(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingId(null);
    }
  }

  const filtered =
    filter === "SEMUA"
      ? initialData
      : filter === "PENDING"
      ? initialData.filter((p) => p.status === "PENDING")
      : filter === "LULUS"
      ? initialData.filter(
          (p) => p.status === "LULUS" || p.tahap === "SELESAI"
        )
      : filter === "TIDAK_LULUS"
      ? initialData.filter((p) => p.status === "TIDAK_LULUS")
      : initialData.filter((p) => p.tahap === filter);

  const filters = [
    { value: "PENDING", label: "Menunggu" },
    { value: "PRADIKSAR", label: "Pradiksar 1 & 2" },
    { value: "DIKSAR", label: "Diksar" },
    { value: "LULUS", label: "Lulus" },
    { value: "TIDAK_LULUS", label: "Tidak Lulus" },
    { value: "SEMUA", label: "Semua" },
  ];

  return (
    <div>
      <div className="card mb-6 overflow-x-auto">
        <div className="mb-4">
          <h2 className="font-semibold">Permintaan Pendaftaran Google</h2>
          <p className="text-sm text-slate-500 mt-1">Nama dan email dari Google. Buat akun melalui menu Kelola Akun, lalu tandai permintaan ini selesai.</p>
        </div>
        <table className="table-admin">
          <thead><tr><th>Nama</th><th>Email</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {googleRequests.map((request) => <tr key={request.id}>
              <td className="font-medium">{request.nama}</td>
              <td>{request.email}</td>
              <td>{formatTanggalWaktu(request.createdAt)}</td>
              <td><span className={`badge ${request.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"}`}>{request.status === "PENDING" ? "Menunggu" : "Selesai"}</span></td>
              <td>{request.status === "PENDING" ? <button disabled={googleLoadingId === request.id} onClick={() => markGoogleRequestProcessed(request.id)} className="text-xs font-semibold text-green-600 disabled:opacity-50">{googleLoadingId === request.id ? "Menyimpan..." : "Tandai selesai"}</button> : "-"}</td>
            </tr>)}
            {googleRequests.length === 0 && <tr><td colSpan={5} className="py-5 text-center text-slate-400">Belum ada permintaan dari Google.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="card mb-6 space-y-4">
        <div>
          <h2 className="font-semibold">Link Grup WhatsApp</h2>
          <p className="text-sm text-slate-500 mt-1">Link Pradiksar dikirim saat pendaftaran, sedangkan link Diksar dikirim setelah lolos tahap Pradiksar gabungan.</p>
        </div>
        {(["PRADIKSAR", "DIKSAR"] as const).map((tahap) => (
          <div key={tahap}>
            <label className="label">{tahap === "PRADIKSAR" ? "Link WhatsApp Pradiksar 1 & 2" : "Link WhatsApp Diksar"}</label>
            <input
              type="url"
              className="input"
              value={links[tahap] || ""}
              onChange={(event) => setLinks({ ...links, [tahap]: event.target.value })}
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>
        ))}
        <button type="button" className="btn-primary" disabled={savingLinks} onClick={saveLinks}>
          {savingLinks ? "Menyimpan..." : "Simpan Link WhatsApp"}
        </button>
      </div>
      {/* FILTER */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`badge transition ${
              filter === f.value
                ? "bg-primary text-white"
                : "bg-surface-light dark:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIM</th>
              <th>WhatsApp</th>
              <th>Alamat</th>
              <th>Tgl. Lahir</th>
              <th>Tahap</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const tahap = p.tahap || "PRADIKSAR";
              const isLoading = loadingId === p.id;

              return (
                <tr key={p.id}>
                  {/* NAMA */}
                  <td className="font-medium">
                    <button
                      onClick={() => setDetail(p)}
                      className="hover:text-primary dark:hover:text-accent underline decoration-dotted"
                    >
                      {p.nama}
                    </button>
                  </td>

                  <td className="max-w-48 whitespace-normal">{p.alamat || "-"}</td>

                  <td>{p.tanggalLahir ? new Date(p.tanggalLahir).toLocaleDateString("id-ID") : "-"}</td>

                  {/* NIM */}
                  <td>{p.nim}</td>

                  {/* WHATSAPP */}
                  <td>
                    <div className="text-sm">
                      <div>{p.noHp}</div>

                      <button
                        onClick={() => {
                          setDetail(p);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Lihat rincian
                      </button>
                    </div>
                  </td>

                  {/* TAHAP */}
                  <td>
                    <span
                      className={`badge ${
                        tahapColor[tahap] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tahapLabel[tahap] || tahap}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`badge ${
                        statusColor[p.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  {/* TANGGAL */}
                  <td>{formatTanggalWaktu(p.createdAt)}</td>

                  {/* AKSI */}
                  <td>
                    {p.status === "PENDING" ? (
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <button
                          disabled={isLoading}
                          onClick={() =>
                            handleAction(
                              p.id,
                              "LULUS",
                              p.noHp,
                              p.nama,
                              tahap
                            )
                          }
                          className="text-xs font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          {isLoading ? "Memproses..." : "✓ Lulus"}
                        </button>

                        <button
                          disabled={isLoading}
                          onClick={() =>
                            handleAction(
                              p.id,
                              "TIDAK_LULUS",
                              p.noHp,
                              p.nama,
                              tahap
                            )
                          }
                          className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {isLoading ? "Memproses..." : "✕ Tidak Lulus"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDetail(p)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Detail
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center text-slate-400 py-6"
                >
                  Tidak ada data pendaftaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {detail && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">
                Detail Pendaftaran
              </h3>

              <button
                onClick={() => setDetail(null)}
                className="text-slate-400 hover:text-red-500 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* STATUS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Tahap Seleksi
                  </p>

                  <span
                    className={`badge ${
                      tahapColor[detail.tahap] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tahapLabel[detail.tahap] ||
                      detail.tahap ||
                      "Pradiksar 1 & 2"}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Status
                  </p>

                  <span
                    className={`badge ${
                      statusColor[detail.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {detail.status}
                  </span>
                </div>
              </div>

              {/* DATA PENDAFTAR */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <b>Nama</b>
                  <span>{detail.nama}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>NIM</b>
                  <span>{detail.nim}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>WhatsApp Tujuan</b>
                  <span className="text-right break-all">
                    {detail.noHp}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>No. HP / WhatsApp</b>
                  <span>{detail.noHp}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Program Studi</b>
                  <span>{detail.prodi}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Angkatan</b>
                  <span>{detail.angkatan}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Alamat</b>
                  <span className="text-right whitespace-pre-wrap">{detail.alamat || "-"}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Tanggal Lahir</b>
                  <span>{detail.tanggalLahir ? new Date(detail.tanggalLahir).toLocaleDateString("id-ID") : "-"}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Cabang / Divisi</b>
                  <span>{detail.divisiPilihan || "-"}</span>
                </div>
              </div>

              {/* MOTIVASI */}
              <div className="border-t pt-4">
                <p className="font-semibold text-sm mb-2">
                  Motivasi
                </p>

                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {detail.motivasi || "-"}
                </div>
              </div>

              {/* TANGGAL */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <p>
                  <b>Pendaftaran:</b>{" "}
                  {formatTanggalWaktu(detail.createdAt)}
                </p>

                {detail.tanggalPradiksar1 && (
                  <p>
                    <b>Lulus Pradiksar 1 & 2:</b>{" "}
                    {formatTanggalWaktu(detail.tanggalPradiksar1)}
                  </p>
                )}


                {detail.tanggalDiksar && (
                  <p>
                    <b>Lulus Diksar:</b>{" "}
                    {formatTanggalWaktu(detail.tanggalDiksar)}
                  </p>
                )}

                {detail.tanggalLulus && (
                  <p>
                    <b>Tanggal Lulus:</b>{" "}
                    {formatTanggalWaktu(detail.tanggalLulus)}
                  </p>
                )}
              </div>

              {/* AKSI DI DETAIL */}
              {detail.status === "PENDING" && (
                <div className="border-t pt-4">
                  <p className="text-xs text-slate-500 mb-3">
                    Notifikasi WhatsApp akan dikirim ke:
                  </p>

                  <div className="bg-slate-100 dark:bg-white/10 rounded-lg p-3 text-sm mb-3 break-all">
                    {detail.noHp}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={loadingId === detail.id}
                      onClick={() =>
                        handleAction(
                          detail.id,
                          "LULUS",
                          detail.noHp,
                          detail.nama,
                          detail.tahap || "PRADIKSAR"
                        )
                      }
                      className="btn-primary"
                    >
                      {loadingId === detail.id
                        ? "Mengirim..."
                        : "✓ Lulus & Kirim WhatsApp"}
                    </button>

                    <button
                      disabled={loadingId === detail.id}
                      onClick={() =>
                        handleAction(
                          detail.id,
                          "TIDAK_LULUS",
                          detail.noHp,
                          detail.nama,
                          detail.tahap || "PRADIKSAR"
                        )
                      }
                      className="btn-outline text-red-500"
                    >
                      {loadingId === detail.id
                        ? "Mengirim..."
                        : "✕ Tidak Lulus"}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setDetail(null)}
                className="btn-outline w-full"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
