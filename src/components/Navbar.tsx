"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";
import DarkModeToggle from "./DarkModeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/profil", label: "Profil" },
  { href: "/visi-misi", label: "Visi & Misi" },
  { href: "/struktur-organisasi", label: "Struktur" },
  { href: "/galeri", label: "Galeri" },
  { href: "/berita", label: "Berita" },
  { href: "/agenda", label: "Agenda" },
  { href: "/prestasi", label: "Prestasi" },
  { href: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 shadow-xs">
        <nav className="container-page flex h-16 items-center justify-between gap-4">
          {/* Logo dan Brand */}
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-slate-900 dark:text-white transition-opacity hover:opacity-80">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 shadow-sm">
              <Image src="/branding/logo-ukm.png" alt="Logo UKM" fill className="object-cover" priority />
            </div>
            <span className="hidden sm:inline text-sm font-semibold tracking-tight rounded-full px-3 py-1">UKM Olahraga</span>
          </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? "text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <DarkModeToggle />
          
          {session ? (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              <Link
                href={session.user.role === "ANGGOTA" ? "/akun-saya" : "/dashboard"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              >
                <FiUser size={18} />
                <span>{session.user.name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              <Link href="/login" className="btn-primary !px-4 !py-2 text-sm">
                Masuk
              </Link>
              <Link href="/pendaftaran" className="btn-secondary !px-4 !py-2 text-sm">
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden ml-auto p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark animate-in fade-in duration-200">
          <div className="container-page py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <DarkModeToggle />
              {session ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <FiLogOut size={18} />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="btn-primary !px-3 !py-2 text-xs whitespace-nowrap">
                    Masuk
                  </Link>
                  <Link href="/pendaftaran" className="btn-secondary !px-3 !py-2 text-xs whitespace-nowrap" onClick={() => setIsOpen(false)}>
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            {session && (
              <Link
                href={session.user.role === "ANGGOTA" ? "/akun-saya" : "/dashboard"}
                onClick={() => setIsOpen(false)}
                className="block mt-4 px-4 py-3 rounded-lg text-sm font-semibold text-center bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                {session.user.role === "ANGGOTA" ? "Akun Saya" : "Dashboard"}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
