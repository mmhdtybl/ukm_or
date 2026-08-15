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
          Tim kami akan meninjau pendaftaranmu; jika diterima, kamu akan menerima email berisi <b>link grup WhatsApp</b> untuk bergabung terlebih dahulu.
        </p>
        <div className="card">
          <PendaftaranForm />
        </div>
      </div>
    </div>
  );
}
