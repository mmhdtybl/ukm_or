"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiUsers,
  FiAward,
  FiClock,
  FiX,
} from "react-icons/fi";

import KameraPresensi from "@/components/KameraPresensi";
import { formatTanggal } from "@/lib/utils";

export default function AbsensiAgendaPage() {
  const params = useParams();
  const agendaId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [agenda, setAgenda] = useState<any>(null);

  const [statistik, setStatistik] = useState({
    total: 0,
    hadir: 0,
    izin: 0,
  });

  const [ranking, setRanking] = useState<any[]>([]);
  const [absensiList, setAbsensiList] = useState<any[]>([]);
  const [userAbsensi, setUserAbsensi] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] =
    useState<"HADIR" | "IZIN">("HADIR");
  const [alasanIzin, setAlasanIzin] = useState("");
  const [previewFoto, setPreviewFoto] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (agendaId) {
      loadData();
    }
  }, [agendaId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const sessionRes =
        await fetch("/api/auth/session");

      const sessionData =
        await sessionRes.json();

      setSession(sessionData);

      const agendaRes =
        await fetch(`/api/agenda/${agendaId}`);

      if (!agendaRes.ok) {
        throw new Error(
          "Kegiatan tidak ditemukan."
        );
      }

      const agendaData =
        await agendaRes.json();

      setAgenda(agendaData);

      const absenRes =
        await fetch(
          `/api/absensi?agendaId=${agendaId}`
        );

      if (!absenRes.ok) {
        throw new Error(
          "Gagal mengambil data presensi."
        );
      }

      const data = await absenRes.json();

      setStatistik(data.statistik);
      setRanking(data.ranking);
      setAbsensiList(data.data);

      const saya = data.data.find(
        (a: any) =>
          a.userId === sessionData?.user?.id
      );

      setUserAbsensi(saya || null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data."
      );
    } finally {
      setLoading(false);
    }
  }

  const canPresensi =
    session?.user?.role !== "ADMIN" &&
    session?.user?.kodeJabatan !== "DPO";

  async function kirimIzin() {
    if (!alasanIzin.trim()) {
      setError("Alasan izin wajib diisi.");
      return;
    }

    try {
      setError("");

      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agendaId,
          status: "IZIN",
          alasanIzin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Gagal mengirim izin."
        );
      }

      setAlasanIzin("");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim izin."
      );
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 text-center text-slate-500">
        Memuat data...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <Link
            href="/akun-saya"
            className="inline-flex items-center gap-2 text-primary mb-4"
          >
            <FiArrowLeft />
            Kembali
          </Link>

          <h1 className="text-3xl font-bold">
            Presensi Kegiatan
          </h1>

          {agenda && (
            <div className="mt-3 text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-lg">
                {agenda.judul}
              </p>

              <p>
                {formatTanggal(
                  agenda.tanggalMulai
                )}
              </p>

              <p>{agenda.lokasi}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="card text-center">
            <FiUsers
              className="mx-auto mb-2"
              size={24}
            />

            <p className="text-2xl font-bold">
              {statistik.total}
            </p>

            <p className="text-sm text-slate-500">
              Total
            </p>
          </div>

          <div className="card text-center">
            <FiCheckCircle
              className="mx-auto mb-2 text-green-500"
              size={24}
            />

            <p className="text-2xl font-bold">
              {statistik.hadir}
            </p>

            <p className="text-sm text-slate-500">
              Hadir
            </p>
          </div>

          <div className="card text-center">
            <FiClock
              className="mx-auto mb-2 text-blue-500"
              size={24}
            />

            <p className="text-2xl font-bold">
              {statistik.izin}
            </p>

            <p className="text-sm text-slate-500">
              Izin
            </p>
          </div>

          <div className="card text-center">
            <FiAward
              className="mx-auto mb-2 text-yellow-500"
              size={24}
            />

            <p className="text-2xl font-bold">
              {statistik.total -
                statistik.hadir -
                statistik.izin}
            </p>

            <p className="text-sm text-slate-500">
              Belum
            </p>
          </div>
        </div>

        <div className="card">

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiAward className="text-yellow-500" />
            Ranking Datang Paling Awal
          </h2>

          {ranking.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              Belum ada peserta yang hadir.
            </p>
          ) : (
            <div className="space-y-3">
              {ranking.slice(0, 10).map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">

                      <div className="text-2xl">
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {item.user.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.user.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-medium">
                      {new Date(
                        item.createdAt
                      ).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {userAbsensi ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">

            <div className="flex items-center gap-2 mb-4">
              <FiCheckCircle
                className="text-green-500"
                size={22}
              />

              <h3 className="font-bold">
                Anda sudah presensi
              </h3>
            </div>

            <p className="mb-3">
              Status:
              <strong className="ml-1">
                {userAbsensi.status}
              </strong>
            </p>

            {userAbsensi.alasanIzin && (
              <p className="mb-3">
                Alasan:{" "}
                {userAbsensi.alasanIzin}
              </p>
            )}

            {userAbsensi.fotoUrl && (
              <div
                className="relative h-64 rounded-xl overflow-hidden cursor-pointer"
                onClick={() =>
                  setPreviewFoto(
                    userAbsensi.fotoUrl
                  )
                }
              >
                <Image
                  src={userAbsensi.fotoUrl}
                  alt="Foto presensi"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ) : canPresensi ? (
          <div className="card">

            <h3 className="text-xl font-bold mb-5">
              Lakukan Presensi
            </h3>

            <div className="flex gap-3 mb-5">

              <button
                type="button"
                className={`px-5 py-2 rounded-lg ${
                  status === "HADIR"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
                onClick={() =>
                  setStatus("HADIR")
                }
              >
                Hadir
              </button>

              <button
                type="button"
                className={`px-5 py-2 rounded-lg ${
                  status === "IZIN"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
                onClick={() =>
                  setStatus("IZIN")
                }
              >
                Izin
              </button>

            </div>

            {status === "HADIR" ? (
              <KameraPresensi
  agendaId={agendaId}
/>
            ) : (
              <div className="space-y-4">

                <textarea
                  rows={4}
                  value={alasanIzin}
                  onChange={(e) =>
                    setAlasanIzin(
                      e.target.value
                    )
                  }
                  placeholder="Masukkan alasan izin..."
                  className="textarea w-full"
                />

                <button
                  type="button"
                  onClick={kirimIzin}
                  className="btn-primary"
                >
                  Kirim Izin
                </button>

              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 rounded-xl p-5">
            <p className="font-semibold">
              Admin dan DPO tidak dapat melakukan
              presensi.
            </p>
          </div>
        )}

        <div className="card">

          <h2 className="text-xl font-bold mb-6">
            Daftar Presensi ({absensiList.length})
          </h2>

          {absensiList.length === 0 ? (
            <p className="text-center py-10 text-slate-500">
              Belum ada data presensi.
            </p>
          ) : (
            <div className="space-y-4">

              {absensiList.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex justify-between gap-4">

                    <div className="flex-1">

                      <h4 className="font-semibold">
                        {item.user.name}
                      </h4>

                      <p className="text-xs text-slate-500">
                        {item.user.role}
                      </p>

                      <p className="text-sm mt-2">
                        Status:
                        <span className="font-semibold ml-1">
                          {item.status}
                        </span>
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatTanggal(
                          new Date(
                            item.createdAt
                          )
                        )}
                      </p>

                      {item.alasanIzin && (
                        <p className="mt-2 text-sm">
                          {item.alasanIzin}
                        </p>
                      )}
                    </div>

                    {item.fotoUrl && (
                      <div
                        className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() =>
                          setPreviewFoto(
                            item.fotoUrl
                          )
                        }
                      >
                        <Image
                          src={item.fotoUrl}
                          alt="Foto presensi"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewFoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() =>
            setPreviewFoto("")
          }
        >
          <div className="relative w-full max-w-3xl aspect-[4/5]">

            <Image
              src={previewFoto}
              alt="Preview foto presensi"
              fill
              className="object-contain"
            />

            <button
              type="button"
              className="absolute top-4 right-4 bg-white text-black rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewFoto("");
              }}
            >
              <FiX size={20} />
            </button>

          </div>
        </div>
      )}
    </>
  );
}