"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiCamera,
  FiRefreshCw,
  FiCheckCircle,
  FiSave,
} from "react-icons/fi";

interface KameraPresensiProps {
  agendaId: string;
  onChange?: (file: File) => void;
  onSave?: (file: File) => Promise<void> | void;
}

export default function KameraPresensi({
  agendaId,
  onChange,
  onSave,
}: KameraPresensiProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [kameraAktif, setKameraAktif] = useState(false);
  const [preview, setPreview] = useState("");
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =====================================================
  // AKTIFKAN KAMERA
  // =====================================================

  async function nyalakanKamera() {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Browser Anda tidak mendukung akses kamera.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setKameraAktif(true);
    } catch (err) {
      console.error(err);

      setError(
        "Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan."
      );
    }
  }

  // =====================================================
  // MATIKAN KAMERA
  // =====================================================

  function matikanKamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setKameraAktif(false);
  }

  // =====================================================
  // AMBIL FOTO
  // =====================================================

  function ambilFoto() {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Tidak dapat mengambil gambar dari kamera.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setPreview(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Gagal membuat file foto.");
          return;
        }

        const file = new File(
          [blob],
          `presensi-${agendaId}-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setFileFoto(file);
        onChange?.(file);
      },
      "image/jpeg",
      0.9
    );

    matikanKamera();
  }

  // =====================================================
  // FOTO ULANG
  // =====================================================

  function fotoUlang() {
    setPreview("");
    setFileFoto(null);
    setError("");

    nyalakanKamera();
  }

  // =====================================================
  // SIMPAN
  // =====================================================

  async function simpanFoto() {
    if (!fileFoto) {
      setError("Silakan ambil foto terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (onSave) {
        await onSave(fileFoto);
      } else {
        const formData = new FormData();
        formData.append("file", fileFoto);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.message || "Gagal mengunggah foto.");
        }

        const presensiRes = await fetch("/api/presensi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agendaId, fotoUrl: uploadData.url }),
        });
        const presensiData = await presensiRes.json();
        if (!presensiRes.ok) {
          throw new Error(presensiData.message || "Gagal menyimpan presensi.");
        }

        setPreview("");
        setFileFoto(null);
        window.location.assign("/dashboard/presensi");
      }
    } catch (err) {
      console.error(err);

      setError("Gagal menyimpan foto presensi.");
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // CLEANUP KAMERA
  // =====================================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-5">

      {/* CAMERA / PREVIEW */}
      <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">

        {!preview && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${
              kameraAktif ? "block" : "hidden"
            }`}
          />
        )}

        {/* KAMERA BELUM AKTIF */}
        {!kameraAktif && !preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-white/10 grid place-items-center mb-4">
              <FiCamera size={30} />
            </div>

            <p className="font-semibold text-lg">
              Kamera belum aktif
            </p>

            <p className="text-sm text-white/60 mt-1">
              Aktifkan kamera untuk mengambil foto presensi.
            </p>
          </div>
        )}

        {/* PREVIEW FOTO */}
        {preview && (
          <img
            src={preview}
            alt="Preview foto presensi"
            className="w-full h-full object-cover"
          />
        )}

        {/* OVERLAY KAMERA */}
        {kameraAktif && (
          <div className="absolute inset-0 pointer-events-none">

            <div className="absolute inset-5 border-2 border-white/50 rounded-2xl" />

            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <span className="bg-black/50 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full">
                Kamera aktif
              </span>
            </div>

          </div>
        )}
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* AKTIFKAN KAMERA */}
      {!kameraAktif && !preview && (
        <button
          type="button"
          onClick={nyalakanKamera}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <FiCamera size={18} />
          Aktifkan Kamera
        </button>
      )}

      {/* AMBIL FOTO */}
      {kameraAktif && (
        <button
          type="button"
          onClick={ambilFoto}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <FiCamera size={18} />
          Ambil Foto
        </button>
      )}

      {/* SETELAH FOTO DIAMBIL */}
      {preview && fileFoto && (
        <div className="space-y-3">

          <div className="flex items-center justify-center gap-2 text-green-500 text-sm font-medium">
            <FiCheckCircle />
            Foto berhasil diambil
          </div>

          {/* SIMPAN */}
          <button
            type="button"
            onClick={simpanFoto}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <FiSave size={18} />

            {saving
              ? "Menyimpan..."
              : "Simpan Presensi"}
          </button>

          {/* FOTO ULANG */}
          <button
            type="button"
            onClick={fotoUlang}
            disabled={saving}
            className="btn-outline w-full flex items-center justify-center gap-2"
          >
            <FiRefreshCw size={17} />
            Foto Ulang
          </button>

        </div>
      )}

    </div>
  );
}