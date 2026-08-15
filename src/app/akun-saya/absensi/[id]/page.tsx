"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiCheckCircle, FiCamera, FiX } from "react-icons/fi";
import { formatTanggal } from "@/lib/utils";

export default function AbsensiAgendaPage() {
  const params = useParams();
  const router = useRouter();
  const agendaId = params.id as string;

  const [agenda, setAgenda] = useState<any>(null);
  const [absensiList, setAbsensiList] = useState<any[]>([]);
  const [userAbsensi, setUserAbsensi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAbsenForm, setShowAbsenForm] = useState(false);
  const [fotoUrl, setFotoUrl] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // Load agenda dan absensi list
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // Get agenda
        const agendaRes = await fetch(`/api/agenda/${agendaId}`);
        if (!agendaRes.ok) throw new Error("Kegiatan tidak ditemukan");
        const agendaData = await agendaRes.json();
        setAgenda(agendaData);

        // Get absensi list
        const absenRes = await fetch(`/api/absensi?agendaId=${agendaId}`);
        if (absenRes.ok) {
          const absenData = await absenRes.json();
          setAbsensiList(absenData);

          // Check if current user sudah absen
          // Kita perlu get session terlebih dahulu, tapi untuk sekarang assume data sudah benar
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (agendaId) loadData();
  }, [agendaId]);

  // Submit absensi
  async function handleAbsen() {
    if (!fotoUrl && !keterangan) {
      setError("Silakan upload foto atau masukkan keterangan");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agendaId,
          fotoUrl: fotoUrl || null,
          status: "HADIR",
          keterangan: keterangan || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan absensi");
      }

      setSuccess("Absensi berhasil disimpan");
      setFotoUrl("");
      setKeterangan("");
      setShowAbsenForm(false);
      setUserAbsensi(data);

      // Reload absensi list
      const newList = await fetch(`/api/absensi?agendaId=${agendaId}`);
      if (newList.ok) {
        setAbsensiList(await newList.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center text-slate-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/akun-saya"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark mb-4"
        >
          <FiArrowLeft size={16} />
          Kembali
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Absensi Kegiatan
        </h1>

        {agenda && (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-primary dark:text-primary-light">
              {agenda.judul}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatTanggal(agenda.tanggalMulai)} • {agenda.lokasi}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 text-green-700 dark:text-green-300 flex items-center gap-2">
          <FiCheckCircle size={18} />
          {success}
        </div>
      )}

      {/* USER ABSENSI STATUS */}
      {userAbsensi ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiCheckCircle size={24} className="text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Anda Sudah Absen
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Status: {userAbsensi.status}
              </p>
            </div>
          </div>
          {userAbsensi.fotoUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Foto Absensi:
              </p>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={userAbsensi.fotoUrl}
                  alt="Foto absensi"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Belum Absen
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Silakan absen dengan mengupload foto atau menambahkan keterangan.
          </p>
          <button
            onClick={() => setShowAbsenForm(!showAbsenForm)}
            className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <FiCamera size={16} />
            Mulai Absen
          </button>
        </div>
      )}

      {/* FORM ABSEN */}
      {showAbsenForm && !userAbsensi && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Form Absensi
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Foto Absensi (URL)
              </label>
              <input
                type="url"
                placeholder="Paste URL foto di sini"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                className="input"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Anda bisa upload foto ke storage terlebih dahulu
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Keterangan (Opsional)
              </label>
              <textarea
                placeholder="Tambahkan keterangan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="textarea"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAbsen}
                disabled={saving}
                className="btn-primary !py-2 !px-6"
              >
                {saving ? "Menyimpan..." : "Simpan Absensi"}
              </button>
              <button
                onClick={() => setShowAbsenForm(false)}
                className="btn-outline !py-2 !px-6"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAFTAR ABSENSI */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Daftar Absensi ({absensiList.length})
        </h3>

        {absensiList.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            Belum ada yang absen untuk kegiatan ini.
          </p>
        ) : (
          <div className="space-y-4">
            {absensiList.map((absensi) => (
              <div
                key={absensi.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {absensi.user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Status: <span className="font-medium">{absensi.status}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTanggal(new Date(absensi.createdAt))}
                    </p>
                    {absensi.keterangan && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                        {absensi.keterangan}
                      </p>
                    )}
                  </div>
                  {absensi.fotoUrl && (
                    <div className="ml-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={absensi.fotoUrl}
                          alt="Foto absensi"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
