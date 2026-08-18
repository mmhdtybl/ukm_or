import { prisma } from "@/lib/prisma";
import KontakForm from "./KontakForm";
import { FiMapPin, FiMail, FiPhone, FiInstagram } from "react-icons/fi";

export const metadata = { title: "Laporan" };

export default async function KontakPage() {
  const profil = await prisma.profilUKM.findFirst();

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Bantuan Pengguna</span>
      <h1 className="section-title mb-10">Laporan</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="space-y-4 mb-8">
            <div>
              <h2 className="font-semibold text-xl mb-2">Ada kendala atau ide?</h2>
              <p className="text-slate-600 dark:text-slate-300">Laporkan bug, ajukan perbaikan, atau kirim saran untuk website UKM Olahraga. Admin akan membaca setiap laporan yang masuk.</p>
            </div>
            {profil?.alamat && (
              <div className="flex gap-3 items-start">
                <FiMapPin className="text-primary dark:text-accent mt-1" />
                <p className="text-slate-600 dark:text-slate-300">{profil.alamat}</p>
              </div>
            )}
            {profil?.email && (
              <div className="flex gap-3 items-start">
                <FiMail className="text-primary dark:text-accent mt-1" />
                <p className="text-slate-600 dark:text-slate-300">{profil.email}</p>
              </div>
            )}
            {profil?.telepon && (
              <div className="flex gap-3 items-start">
                <FiPhone className="text-primary dark:text-accent mt-1" />
                <p className="text-slate-600 dark:text-slate-300">{profil.telepon}</p>
              </div>
            )}
            {profil?.instagram && (
              <div className="flex gap-3 items-start">
                <FiInstagram className="text-primary dark:text-accent mt-1" />
                <a href={profil.instagram} className="text-slate-600 dark:text-slate-300 hover:text-primary">{profil.instagram}</a>
              </div>
            )}
          </div>
          <div className="rounded-xl2 h-40 bg-surface-light dark:bg-white/5 flex items-center p-6 text-slate-500 dark:text-slate-400 text-sm">
            Untuk laporan bug, jelaskan halaman yang dibuka dan apa yang terjadi agar kami dapat menindaklanjutinya lebih cepat.
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-xl mb-4">Kirim Laporan</h2>
          <KontakForm />
        </div>
      </div>
    </div>
  );
}
