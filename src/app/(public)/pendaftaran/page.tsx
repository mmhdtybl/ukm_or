import PendaftaranForm from "./PendaftaranForm";

export const metadata = { title: "Pendaftaran Anggota" };

export default function PendaftaranPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl mx-auto">
        <span className="section-eyebrow">Bergabung Bersama Kami</span>
        <h1 className="section-title mb-3">Formulir Pendaftaran Anggota</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Lengkapi data di bawah ini. Formulir ini <b>hanya untuk mendaftar</b> — belum ada akun login yang dibuat.
          Setelah mendaftar, kamu langsung masuk tahap <b>Pradiksar 1 dan Pradiksar 2</b>. Link grup WhatsApp Pradiksar dikirim saat pendaftaran, lalu link Diksar dikirim setelah kamu lolos Pradiksar.
        </p>
        <div className="card">
          <PendaftaranForm />
        </div>
      </div>
    </div>
  );
}
