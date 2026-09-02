"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";
import ExportExcelButton from "./ExportExcelButton";

const statusColor: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-600",
  LULUS: "bg-green-100 text-green-700",
  TIDAK_LULUS: "bg-red-100 text-red-600",
  SELESAI: "bg-green-100 text-green-700",
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

type Props = {
  initialData?: any[];
  initialLinks?: any[];
  initialGoogleRequests?: any[];
};

export default function PendaftaranManager({
  initialData,
  initialLinks,
  initialGoogleRequests,
}: Props) {
  const router = useRouter();

  /* =========================================================
     DATA AMAN
     ========================================================= */

  const safeInitialData = Array.isArray(initialData)
    ? initialData
    : [];

  const safeInitialLinks = Array.isArray(initialLinks)
    ? initialLinks
    : [];

  const safeInitialGoogleRequests = Array.isArray(
    initialGoogleRequests
  )
    ? initialGoogleRequests
    : [];

  /* =========================================================
     STATE
     ========================================================= */

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [googleLoadingId, setGoogleLoadingId] =
    useState<string | null>(null);

  const [filter, setFilter] = useState("PENDING");
  const [detail, setDetail] = useState<any>(null);

  /* =========================================================
     LINK WHATSAPP
     ========================================================= */

  const [links, setLinks] = useState<Record<string, string>>(() => {
    const savedLinks = Object.fromEntries(
      safeInitialLinks.map((item) => [
        item.tahap,
        item.link,
      ])
    );

    // Kompatibilitas dengan data lama
    if (
      !savedLinks.PRADIKSAR &&
      savedLinks.PRADIKSAR_1
    ) {
      savedLinks.PRADIKSAR = savedLinks.PRADIKSAR_1;
    }

    return savedLinks;
  });

  const [savingLinks, setSavingLinks] = useState(false);

  /* =========================================================
     GOOGLE REQUESTS
     ========================================================= */

  const [googleRequests, setGoogleRequests] = useState<any[]>(
    safeInitialGoogleRequests
  );

  /* =========================================================
     TANDAI GOOGLE SELESAI
     ========================================================= */

  async function markGoogleRequestProcessed(id: string) {
    setGoogleLoadingId(id);

    try {
      const response = await fetch(
        `/api/pendaftaran/google/${id}`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal memperbarui permintaan Google."
        );
      }

      setGoogleRequests((items) =>
        (Array.isArray(items) ? items : []).map((item) =>
          item.id === id
            ? {
                ...item,
                status: "SELESAI",
              }
            : item
        )
      );

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui permintaan Google."
      );
    } finally {
      setGoogleLoadingId(null);
    }
  }

  /* =========================================================
     SIMPAN LINK WHATSAPP
     ========================================================= */

  async function saveLinks() {
    setSavingLinks(true);

    try {
      const response = await fetch(
        "/api/pendaftaran/whatsapp",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            links,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menyimpan link WhatsApp."
        );
      }

      alert("Link WhatsApp berhasil disimpan.");

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan link WhatsApp."
      );
    } finally {
      setSavingLinks(false);
    }
  }

  /* =========================================================
     AKSI PENDAFTARAN
     ========================================================= */

  async function handleAction(
    id: string,
    status: "LULUS" | "TIDAK_LULUS",
    noHp: string,
    nama: string,
    tahap: string
  ) {
    const isLulus = status === "LULUS";

    const konfirmasi = window.confirm(
      `${isLulus ? "LULUSKAN" : "TIDAK LULUSKAN"} pendaftar ini?\n\n` +
        `Nama: ${nama}\n` +
        `WhatsApp tujuan: ${noHp}\n` +
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

      const res = await fetch(
        `/api/pendaftaran/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Gagal memproses pendaftaran."
        );
        return;
      }

      if (data.whatsappTerkirim) {
        alert(
          `Berhasil diproses.\n\nWhatsApp dikirim ke:\n${data.whatsappTujuan}`
        );
      } else {
        alert(
          `Status berhasil diubah, tetapi WhatsApp gagal dikirim ke:\n${data.whatsappTujuan}`
        );
      }

      setDetail(null);

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingId(null);
    }
  }

  /* =========================================================
     FILTER
     ========================================================= */

  const filtered = useMemo(() => {
    if (filter === "SEMUA") {
      return safeInitialData;
    }

    if (filter === "PENDING") {
      return safeInitialData.filter(
        (p) => p.status === "PENDING"
      );
    }

    if (filter === "LULUS") {
      return safeInitialData.filter(
        (p) =>
          p.status === "LULUS" ||
          p.tahap === "SELESAI"
      );
    }

    if (filter === "TIDAK_LULUS") {
      return safeInitialData.filter(
        (p) => p.status === "TIDAK_LULUS"
      );
    }

    return safeInitialData.filter(
      (p) => p.tahap === filter
    );
  }, [filter, safeInitialData]);

  /* =========================================================
     DATA GOOGLE + PENDAFTARAN
     ========================================================= */

  const combinedData = useMemo(() => {
    const googleData = (
      Array.isArray(googleRequests)
        ? googleRequests
        : []
    ).map((request) => ({
      ...request,

      id: `google-${request.id}`,

      originalGoogleId: request.id,

      nama: request.nama || "-",

      email: request.email || "-",

      createdAt: request.createdAt,

      status: request.status || "PENDING",

      sumber: "GOOGLE",

      tipe: "GOOGLE",
    }));

    const pendaftaranData = filtered.map((item) => ({
      ...item,

      sumber: "PENDAFTARAN",

      tipe: "PENDAFTARAN",
    }));

    return [
      ...googleData,
      ...pendaftaranData,
    ];
  }, [googleRequests, filtered]);

  /* =========================================================
     FILTER BUTTON
     ========================================================= */

  const filters = [
    {
      value: "PENDING",
      label: "Menunggu",
    },
    {
      value: "PRADIKSAR",
      label: "Pradiksar 1 & 2",
    },
    {
      value: "DIKSAR",
      label: "Diksar",
    },
    {
      value: "LULUS",
      label: "Lulus",
    },
    {
      value: "TIDAK_LULUS",
      label: "Tidak Lulus",
    },
    {
      value: "SEMUA",
      label: "Semua",
    },
  ];

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          LINK WHATSAPP
          ===================================================== */}

      <div className="card space-y-4">
        <div>
          <h2 className="font-semibold">
            Link Grup WhatsApp
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Link Pradiksar dikirim saat pendaftaran,
            sedangkan link Diksar dikirim setelah lolos
            tahap Pradiksar gabungan.
          </p>
        </div>

        {(["PRADIKSAR", "DIKSAR"] as const).map(
          (tahap) => (
            <div key={tahap}>
              <label className="label">
                {tahap === "PRADIKSAR"
                  ? "Link WhatsApp Pradiksar 1 & 2"
                  : "Link WhatsApp Diksar"}
              </label>

              <input
                type="url"
                className="input"
                value={links[tahap] || ""}
                onChange={(event) =>
                  setLinks({
                    ...links,
                    [tahap]:
                      event.target.value,
                  })
                }
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          )
        )}

        <button
          type="button"
          className="btn-primary"
          disabled={savingLinks}
          onClick={saveLinks}
        >
          {savingLinks
            ? "Menyimpan..."
            : "Simpan Link WhatsApp"}
        </button>
      </div>

      {/* =====================================================
          FILTER
          ===================================================== */}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() =>
              setFilter(f.value)
            }
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

      {/* =====================================================
          SATU TABEL SAJA
          ===================================================== */}

      <div className="card overflow-x-auto">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">
              Data Pendaftaran
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Semua permintaan pendaftaran dan
              permintaan Google ditampilkan dalam
              satu tabel.
            </p>
          </div>

          <ExportExcelButton
            filename="data-pendaftaran.xlsx"
            headers={["Nama", "NIM/Email", "WhatsApp", "Alamat", "Tahap", "Status", "Sumber", "Tanggal"]}
            rows={combinedData.map((item) => [
              item.nama || "",
              item.nim || item.email || "",
              item.noHp || "",
              item.alamat || "",
              item.tahap ? tahapLabel[item.tahap] || item.tahap : "",
              item.status || "",
              item.sumber || "",
              item.createdAt ? formatTanggalWaktu(item.createdAt) : "",
            ])}
          />
        </div>

        <table className="table-admin">

          <thead>
            <tr>
              <th>Nama</th>
              <th>NIM / Email</th>
              <th>WhatsApp</th>
              <th>Alamat</th>
              <th>Tahap</th>
              <th>Status</th>
              <th>Sumber</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {combinedData.map((item) => {

              /* =================================================
                 DATA GOOGLE
                 ================================================= */

              if (item.tipe === "GOOGLE") {
                const googlePending =
                  item.status === "PENDING";

                const googleLoading =
                  googleLoadingId ===
                  item.originalGoogleId;

                return (
                  <tr key={item.id}>

                    {/* NAMA */}
                    <td className="font-medium">
                      {item.nama}
                    </td>

                    {/* EMAIL */}
                    <td className="max-w-56 whitespace-normal">
                      {item.email}
                    </td>

                    {/* WHATSAPP */}
                    <td>
                      -
                    </td>

                    {/* ALAMAT */}
                    <td>
                      -
                    </td>

                    {/* TAHAP */}
                    <td>
                      -
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`badge ${
                          statusColor[
                            item.status
                          ] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status ===
                        "PENDING"
                          ? "Menunggu"
                          : "Selesai"}
                      </span>
                    </td>

                    {/* SUMBER */}
                    <td>
                      <span className="badge bg-purple-100 text-purple-700">
                        Google
                      </span>
                    </td>

                    {/* TANGGAL */}
                    <td>
                      {item.createdAt
                        ? formatTanggalWaktu(
                            item.createdAt
                          )
                        : "-"}
                    </td>

                    {/* AKSI */}
                    <td>
                      {googlePending ? (
                        <button
                          disabled={
                            googleLoading
                          }
                          onClick={() =>
                            markGoogleRequestProcessed(
                              item.originalGoogleId
                            )
                          }
                          className="text-xs font-semibold text-green-600 disabled:opacity-50"
                        >
                          {googleLoading
                            ? "Menyimpan..."
                            : "Tandai selesai"}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>

                  </tr>
                );
              }

              /* =================================================
                 DATA PENDAFTARAN BIASA
                 ================================================= */

              const tahap =
                item.tahap ||
                "PRADIKSAR";

              const isLoading =
                loadingId === item.id;

              return (
                <tr key={item.id}>

                  {/* NAMA */}
                  <td className="font-medium">

                    <button
                      onClick={() =>
                        setDetail(item)
                      }
                      className="hover:text-primary dark:hover:text-accent underline decoration-dotted"
                    >
                      {item.nama || "-"}
                    </button>

                  </td>

                  {/* NIM */}
                  <td>
                    {item.nim || "-"}
                  </td>

                  {/* WHATSAPP */}
                  <td>

                    <div className="text-sm">

                      <div>
                        {item.noHp || "-"}
                      </div>

                      <button
                        onClick={() =>
                          setDetail(item)
                        }
                        className="text-xs text-primary hover:underline"
                      >
                        Lihat rincian
                      </button>

                    </div>

                  </td>

                  {/* ALAMAT */}
                  <td className="max-w-48 whitespace-normal">
                    {item.alamat || "-"}
                  </td>

                  {/* TAHAP */}
                  <td>

                    <span
                      className={`badge ${
                        tahapColor[tahap] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tahapLabel[tahap] ||
                        tahap}
                    </span>

                  </td>

                  {/* STATUS */}
                  <td>

                    <span
                      className={`badge ${
                        statusColor[
                          item.status
                        ] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status || "-"}
                    </span>

                  </td>

                  {/* SUMBER */}
                  <td>

                    <span className="badge bg-blue-100 text-blue-700">
                      Pendaftaran
                    </span>

                  </td>

                  {/* TANGGAL */}
                  <td>

                    {item.createdAt
                      ? formatTanggalWaktu(
                          item.createdAt
                        )
                      : "-"}

                  </td>

                  {/* AKSI */}
                  <td>

                    {item.status ===
                    "PENDING" ? (

                      <div className="flex flex-col gap-2 min-w-[150px]">

                        {/* LULUS */}
                        <button
                          disabled={
                            isLoading
                          }
                          onClick={() =>
                            handleAction(
                              item.id,
                              "LULUS",
                              item.noHp,
                              item.nama,
                              tahap
                            )
                          }
                          className="text-xs font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          {isLoading
                            ? "Memproses..."
                            : "✓ Lulus"}
                        </button>

                        {/* TIDAK LULUS */}
                        <button
                          disabled={
                            isLoading
                          }
                          onClick={() =>
                            handleAction(
                              item.id,
                              "TIDAK_LULUS",
                              item.noHp,
                              item.nama,
                              tahap
                            )
                          }
                          className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {isLoading
                            ? "Memproses..."
                            : "✕ Tidak Lulus"}
                        </button>

                      </div>

                    ) : (

                      <button
                        onClick={() =>
                          setDetail(item)
                        }
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Detail
                      </button>

                    )}

                  </td>

                </tr>
              );
            })}

            {/* DATA KOSONG */}
            {combinedData.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center text-slate-400 py-8"
                >
                  Tidak ada data pendaftaran.
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>

      {/* =====================================================
          DETAIL MODAL
          ===================================================== */}

      {detail && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"
          onClick={() =>
            setDetail(null)
          }
        >

          <div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">

              <h3 className="font-semibold text-lg">
                Detail Pendaftaran
              </h3>

              <button
                onClick={() =>
                  setDetail(null)
                }
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
                      tahapColor[
                        detail.tahap
                      ] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tahapLabel[
                      detail.tahap
                    ] ||
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
                      statusColor[
                        detail.status
                      ] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {detail.status || "-"}
                  </span>

                </div>

              </div>

              {/* DATA PENDAFTAR */}
              <div className="border-t pt-4 space-y-2 text-sm">

                <div className="flex justify-between gap-4">
                  <b>Nama</b>
                  <span>
                    {detail.nama || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>NIM</b>
                  <span>
                    {detail.nim || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>WhatsApp</b>
                  <span className="text-right break-all">
                    {detail.noHp || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Program Studi</b>
                  <span>
                    {detail.prodi || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Angkatan</b>
                  <span>
                    {detail.angkatan || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Alamat</b>
                  <span className="text-right whitespace-pre-wrap">
                    {detail.alamat || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Tanggal Lahir</b>
                  <span>
                    {detail.tanggalLahir
                      ? new Date(
                          detail.tanggalLahir
                        ).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <b>Cabang / Divisi</b>
                  <span>
                    {detail.divisiPilihan ||
                      "-"}
                  </span>
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
                  {detail.createdAt
                    ? formatTanggalWaktu(
                        detail.createdAt
                      )
                    : "-"}
                </p>

                {detail.tanggalPradiksar1 && (
                  <p>
                    <b>
                      Lulus Pradiksar 1 & 2:
                    </b>{" "}
                    {formatTanggalWaktu(
                      detail.tanggalPradiksar1
                    )}
                  </p>
                )}

                {detail.tanggalDiksar && (
                  <p>
                    <b>Lulus Diksar:</b>{" "}
                    {formatTanggalWaktu(
                      detail.tanggalDiksar
                    )}
                  </p>
                )}

                {detail.tanggalLulus && (
                  <p>
                    <b>Tanggal Lulus:</b>{" "}
                    {formatTanggalWaktu(
                      detail.tanggalLulus
                    )}
                  </p>
                )}

              </div>

              {/* AKSI */}
              {detail.status ===
                "PENDING" && (
                <div className="border-t pt-4">

                  <p className="text-xs text-slate-500 mb-3">
                    Notifikasi WhatsApp akan
                    dikirim ke:
                  </p>

                  <div className="bg-slate-100 dark:bg-white/10 rounded-lg p-3 text-sm mb-3 break-all">
                    {detail.noHp || "-"}
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      disabled={
                        loadingId ===
                        detail.id
                      }
                      onClick={() =>
                        handleAction(
                          detail.id,
                          "LULUS",
                          detail.noHp,
                          detail.nama,
                          detail.tahap ||
                            "PRADIKSAR"
                        )
                      }
                      className="btn-primary"
                    >
                      {loadingId ===
                      detail.id
                        ? "Mengirim..."
                        : "✓ Lulus & Kirim WhatsApp"}
                    </button>

                    <button
                      disabled={
                        loadingId ===
                        detail.id
                      }
                      onClick={() =>
                        handleAction(
                          detail.id,
                          "TIDAK_LULUS",
                          detail.noHp,
                          detail.nama,
                          detail.tahap ||
                            "PRADIKSAR"
                        )
                      }
                      className="btn-outline text-red-500"
                    >
                      {loadingId ===
                      detail.id
                        ? "Mengirim..."
                        : "✕ Tidak Lulus"}
                    </button>

                  </div>

                </div>
              )}

              {/* TUTUP */}
              <button
                onClick={() =>
                  setDetail(null)
                }
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