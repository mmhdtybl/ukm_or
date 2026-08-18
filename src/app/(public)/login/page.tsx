"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      nim: formData.get("nim"),
      password: formData.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("NPM/NIM atau kata sandi salah.");
      return;
    }

    // Arahkan sesuai role: Admin/Pengurus -> /dashboard, Anggota -> /akun-saya
    const session = await getSession();
    const role = (session?.user as any)?.role;
    const tujuan = role === "ANGGOTA" ? "/akun-saya" : "/dashboard";

    router.push(tujuan);
    router.refresh();
  }

  return (
    <div className="container-page py-20">
      <div className="max-w-md mx-auto card">
        <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Masuk</h1>
        <p className="text-sm text-slate-500 mb-6">Login untuk Admin, Pengurus, dan Anggota UKM Olahraga</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">NPM/NIM</label>
            <input name="nim" required className="input" placeholder="Masukkan NPM/NIM Anda TANPA TITIK" />
          </div>
          <div>
            <label className="label">Kata Sandi</label>
            <PasswordInput name="password" required placeholder="••••••••" />
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Memproses..." : "Masuk"}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun anggota?{" "}
          <Link href="/pendaftaran" className="text-primary dark:text-accent font-semibold">
            Daftar di sini
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">
          Email hanya digunakan saat pendaftaran akun, bukan untuk login.
        </p>
      </div>
    </div>
  );
}
