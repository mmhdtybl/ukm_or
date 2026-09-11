"use client";

import { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) {
        const role = (session.user as any)?.role;
        router.replace(role === "ANGGOTA" ? "/akun-saya" : "/dashboard");
      }
    });
  }, [router]);

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

    const session = await getSession();
    const role = (session?.user as any)?.role;
    const tujuan = role === "ANGGOTA" ? "/akun-saya" : "/dashboard";

    router.push(tujuan);
    router.refresh();
  }

  return (
    <div className="container-page py-20">
      <div className="max-w-md mx-auto card">
        {/* Logo + Glow */}
        <div className="relative mx-auto mb-6 h-32 w-32 flex items-center justify-center">
          <div className="anim-pulse-glow absolute inset-0 rounded-full bg-primary/30" />
          <div className="anim-float-slow absolute -inset-3 rounded-full bg-accent/15" />
          <div className="anim-float absolute -inset-6 rounded-full bg-primary-light/10" />
          <Image
            src="/branding/logo-ukm-transparent.png"
            alt="UKM Olahraga"
            width={96}
            height={96}
            className="relative h-24 w-24 rounded-2xl object-contain shadow-lg"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-primary dark:text-white mb-1 text-center">Masuk</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">Login untuk Admin, Pengurus, dan Anggota UKM Olahraga</p>

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
      </div>
    </div>
  );
}
