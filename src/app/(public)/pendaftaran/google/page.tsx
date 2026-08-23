"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PendaftaranGooglePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role) router.replace(role === "ANGGOTA" ? "/akun-saya" : "/dashboard");
  }, [router, session]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/pendaftaran/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) return setError(result.message || "Permintaan pendaftaran gagal dikirim.");
    await signOut({ callbackUrl: "/login?google=registered" });
  }

  if (status === "loading") return <div className="container-page py-20 text-center text-slate-500">Memuat data Google...</div>;
  if (!session?.user) {
    return <div className="container-page py-20 text-center"><p className="text-slate-500">Sesi Google tidak ditemukan.</p><button className="btn-primary mt-4" onClick={() => router.push("/login")}>Kembali ke login</button></div>;
  }

  return <div className="container-page py-16"><div className="card mx-auto max-w-md">
    <h1 className="mb-2 text-2xl font-bold text-primary dark:text-white">Lengkapi Pendaftaran Google</h1>
    <p className="mb-6 text-sm text-slate-500">Data ini akan masuk sebagai notifikasi permintaan pendaftaran untuk admin.</p>
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">Nama</label><input className="input bg-slate-50" value={session.user.name || ""} readOnly /></div>
      <div><label className="label">Email</label><input className="input bg-slate-50" value={session.user.email || ""} readOnly /></div>
      <div><label className="label">NPM/NIM</label><input required autoFocus className="input" value={nim} onChange={(event) => setNim(event.target.value)} placeholder="Masukkan NPM/NIM" /></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="btn-primary w-full">{loading ? "Mengirim..." : "Kirim Permintaan ke Admin"}</button>
    </form>
  </div></div>;
}
