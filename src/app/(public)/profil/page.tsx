import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const metadata = { title: "Profil UKM" };

// Gambar default: dipakai jika Admin belum mengunggah logo/foto lewat Dashboard > Kelola Profil UKM
const DEFAULT_LOGO = "/branding/logo-ukm.png";
const DEFAULT_BG = "/branding/foto-profil-bg.png";

export default async function ProfilPage() {
  const profil = await prisma.profilUKM.findFirst();
  const logoSrc = profil?.logo || DEFAULT_LOGO;

  return (
    <div>
      {/* HERO dengan foto kegiatan sebagai background + overlay gradasi biru tua */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image src={DEFAULT_BG} alt="Kegiatan UKM" fill priority className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary-dark/95" />
        <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle_at_15%_25%,white,transparent_35%),radial-gradient(circle_at_85%_75%,white,transparent_30%)]" />

        <div className="container-page relative py-16 md:py-20 flex flex-col items-center text-center">
          <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-white/10 backdrop-blur border-4 border-white/30 shadow-2xl grid place-items-center overflow-hidden mb-6">
            <Image src={logoSrc} alt={`Logo ${profil?.namaUKM || "UKM"}`} fill className="object-cover" />
          </div>
          <span className="section-eyebrow !text-accent-yellow">Tentang Kami</span>
          <h1 className="text-3xl md:text-4xl font-extrabold">{profil?.namaUKM || "UKM Olahraga"}</h1>
          {profil?.deskripsi && (
            <p className="text-white/85 mt-3 max-w-2xl text-sm md:text-base line-clamp-2">{profil.deskripsi}</p>
          )}
        </div>
      </section>

      {/* KONTEN PROFIL */}
      <div className="container-page py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="font-semibold text-xl mb-3 text-primary dark:text-accent">Deskripsi</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profil?.deskripsi || "Belum ada deskripsi."}
              </p>
            </div>
            {profil?.sejarah && (
              <div className="card">
                <h2 className="font-semibold text-xl mb-3 text-primary dark:text-accent">Sejarah</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{profil.sejarah}</p>
              </div>
            )}
          </div>
          <div className="card h-fit">
            <h3 className="font-semibold mb-3 text-primary dark:text-accent">Informasi Kontak</h3>
            <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
              {profil?.alamat && <li><b>Alamat:</b> {profil.alamat}</li>}
              {profil?.email && <li><b>Email:</b> {profil.email}</li>}
              {profil?.telepon && <li><b>Telepon:</b> {profil.telepon}</li>}
              {!profil?.alamat && !profil?.email && !profil?.telepon && (
                <li className="text-slate-400">Belum ada informasi kontak.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


