"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function PendaftaranForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      nama: String(formData.get("nama") || "").trim(),
      nim: String(formData.get("nim") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      noHp: String(formData.get("noHp") || "").trim(),
      prodi: String(formData.get("prodi") || "").trim(),
      angkatan: String(formData.get("angkatan") || "").trim(),
      alamat: String(formData.get("alamat") || "").trim(),
      tanggalLahir: String(
        formData.get("tanggalLahir") || ""
      ).trim(),
      divisiPilihan: String(
        formData.get("divisiPilihan") || ""
      ).trim(),
      motivasi: String(
        formData.get("motivasi") || ""
      ).trim(),
    };

    try {
      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message:
            text ||
            `Server mengembalikan response ${res.status}`,
        };
      }

      console.log("RESPONSE API:", res.status, data);

      if (!res.ok) {
        setErrorMsg(
          data?.message ||
            `Pendaftaran gagal. HTTP ${res.status}`
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      console.error("FETCH ERROR:", error);

      setErrorMsg(
        "Tidak dapat terhubung ke server. Pastikan server masih berjalan."
      );

      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-5xl mb-4">
          ✓
        </div>

        <p className="text-green-600 font-semibold text-xl mb-2">
          Pendaftaran Berhasil!
        </p>

        <p className="text-slate-500 text-sm">
          Data Anda telah berhasil dikirim dan masuk
          ke tahap <b>Pradiksar 1 dan Pradiksar 2</b>.
        </p>

        <p className="text-slate-500 text-sm mt-2">
          Kami akan mengirim informasi selanjutnya
          melalui WhatsApp dan email yang Anda
          daftarkan.
        </p>

        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 px-5 py-2 rounded-lg bg-blue-600 text-white"
        >
          Daftar Lagi
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* NAMA + NIM */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Nama Lengkap
          </label>

          <input
            name="nama"
            required
            className="input"
            placeholder="Nama lengkap"
          />
        </div>

        <div>
          <label className="label">
            NPM / NIM
          </label>

          <input
            name="nim"
            required
            className="input"
            placeholder="Contoh: 22010001"
          />
        </div>
      </div>

      {/* EMAIL */}
      <div>
        <label className="label">
          Email
        </label>

        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="nama@email.com"
        />

        <p className="text-xs text-slate-500 mt-1">
          Gunakan email yang aktif karena dapat digunakan
          untuk menerima informasi pendaftaran.
        </p>
      </div>

      {/* WHATSAPP */}
      <div>
        <label className="label">
          No. HP / WhatsApp
        </label>

        <input
          name="noHp"
          type="tel"
          required
          autoComplete="tel"
          className="input"
          placeholder="08xxxxxxxxxx"
        />
      </div>

      {/* PROGRAM STUDI + ANGKATAN */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Program Studi
          </label>

          <input
            name="prodi"
            required
            className="input"
            placeholder="Program studi"
          />
        </div>

        <div>
          <label className="label">
            Angkatan
          </label>

          <input
            name="angkatan"
            required
            className="input"
            placeholder="Contoh: 2024"
          />
        </div>
      </div>

      {/* ALAMAT */}
      <div>
        <label className="label">
          Alamat
        </label>

        <textarea
          name="alamat"
          required
          rows={3}
          className="input"
          placeholder="Alamat lengkap sesuai domisili"
        />
      </div>

      {/* TANGGAL LAHIR */}
      <div>
        <label className="label">
          Tanggal Lahir
        </label>

        <input
          name="tanggalLahir"
          type="date"
          required
          className="input"
        />
      </div>

      {/* CABANG OLAHRAGA */}
      <div>
        <label className="label">
          Cabang Olahraga yang Diminati
        </label>

        <select
          name="divisiPilihan"
          required
          className="input"
        >
          <option value="">
            Pilih cabang olahraga
          </option>

          <option value="Voli">
            Voli
          </option>

          <option value="Futsal">
            Futsal
          </option>

          <option value="Bulutangkis">
            Bulutangkis
          </option>

          <option value="E-Sport">
            E-Sport
          </option>

          <option value="Taekwondo">
            Taekwondo
          </option>

          <option value="Basket">
            Basket
          </option>
        </select>
      </div>

      {/* MOTIVASI */}
      <div>
        <label className="label">
          Motivasi Bergabung
        </label>

        <textarea
          name="motivasi"
          required
          minLength={5}
          rows={4}
          className="input"
          placeholder="Ceritakan motivasimu bergabung dengan UKM ini..."
        />
      </div>

      {/* ERROR */}
      {status === "error" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-red-600 text-sm font-medium">
            {errorMsg}
          </p>
        </div>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full disabled:opacity-60"
      >
        {status === "loading"
          ? "Mengirim..."
          : "Kirim Pendaftaran"}
      </button>
    </form>
  );
}