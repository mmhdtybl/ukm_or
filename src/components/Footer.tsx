import Link from "next/link";
import { FiInstagram, FiFacebook, FiYoutube, FiMapPin, FiMail, FiPhone, FiArrowUpRight } from "react-icons/fi";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const profil = await prisma.profilUKM.findFirst().catch(() => null);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-surface-darkCardDeep border-t border-slate-200 dark:border-slate-700">
      {/* Main Content */}
      <div className="container-page py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {profil?.namaUKM || "UKM Olahraga Unimma"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {profil?.deskripsi?.slice(0, 100) || "Wadah pengembangan minat dan bakat mahasiswa."}
              </p>
            </div>
            {(profil?.instagram || profil?.facebook || profil?.youtube) && (
              <div className="flex gap-4 mt-6">
                {profil?.instagram && (
                  <a
                    href={profil.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    aria-label="Instagram"
                  >
                    <FiInstagram size={18} />
                  </a>
                )}
                {profil?.facebook && (
                  <a
                    href={profil.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    aria-label="Facebook"
                  >
                    <FiFacebook size={18} />
                  </a>
                )}
                {profil?.youtube && (
                  <a
                    href={profil.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    aria-label="YouTube"
                  >
                    <FiYoutube size={18} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Jelajahi */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Jelajahi</h4>
            <ul className="space-y-3">
              {[
                { href: "/berita", label: "Berita" },
                { href: "/agenda", label: "Agenda" },
                { href: "/galeri", label: "Galeri" },
                { href: "/prestasi", label: "Prestasi" },
                { href: "/unduhan", label: "Unduhan" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                  >
                    <span>{link.label}</span>
                    <FiArrowUpRight size={14} className="opacity-0 -ml-1.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organisasi */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Organisasi</h4>
            <ul className="space-y-3">
              {[
                { href: "/profil", label: "Profil UKM" },
                { href: "/visi-misi", label: "Visi & Misi" },
                { href: "/struktur-organisasi", label: "Struktur" },
                { href: "/pendaftaran", label: "Pendaftaran" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                  >
                    <span>{link.label}</span>
                    <FiArrowUpRight size={14} className="opacity-0 -ml-1.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Kontak</h4>
            <ul className="space-y-3">
              {profil?.alamat && (
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <FiMapPin className="flex-shrink-0 mt-0.5 text-primary dark:text-primary-light" size={16} />
                  <span>{profil.alamat}</span>
                </li>
              )}
              {profil?.email && (
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <FiMail className="flex-shrink-0 mt-0.5 text-primary dark:text-primary-light" size={16} />
                  <a href={`mailto:${profil.email}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {profil.email}
                  </a>
                </li>
              )}
              {profil?.telepon && (
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <FiPhone className="flex-shrink-0 mt-0.5 text-primary dark:text-primary-light" size={16} />
                  <a href={`tel:${profil.telepon}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {profil.telepon}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8" />
      </div>

      {/* Bottom Section */}
      <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          © {currentYear} {profil?.namaUKM || "UKM Olahraga Unimma"}. Semua hak cipta dilindungi.
        </p>
        <div className="flex gap-6">
          <Link href="/kontak" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/kontak" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Syarat Penggunaan
          </Link>
        </div>
      </div>
    </footer>
  );
}
