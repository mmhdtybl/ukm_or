import { prisma } from "@/lib/prisma";
import KontakForm from "./KontakForm";
import { FiMapPin, FiMail, FiPhone, FiInstagram } from "react-icons/fi";

export const metadata = { title: "Kontak" };

export default async function KontakPage() {
  const profil = await prisma.profilUKM.findFirst();

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Hubungi Kami</span>
      <h1 className="section-title mb-10">Kontak</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="space-y-4 mb-8">
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
          <div className="rounded-xl2 overflow-hidden h-64 bg-surface-light dark:bg-white/5 grid place-items-center text-slate-400 text-sm">
            Peta lokasi (Google Maps embed)
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-xl mb-4">Kirim Pesan</h2>
          <KontakForm />
        </div>
      </div>
    </div>
  );
}
