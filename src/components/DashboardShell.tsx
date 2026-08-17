"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  FiGrid, FiFileText, FiCalendar, FiImage, FiUsers, FiUserCheck,
  FiAward, FiLayout, FiSettings, FiMail, FiUserPlus, FiMenu, FiX, FiLogOut,
  FiCamera, FiArchive, FiDollarSign, FiBox, FiEye, FiMessageSquare, FiUser, FiKey,
} from "react-icons/fi";
import DarkModeToggle from "./DarkModeToggle";
import type { Kapabilitas } from "@/lib/permissions";

export default function DashboardShell({ kap, name, avatar, children }: { kap: Kapabilitas; name: string; avatar: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  const menu = [
    { href: "/dashboard", label: "Statistik", icon: FiGrid, show: kap.role !== "ANGGOTA" },
    { href: "/dashboard/monitoring", label: "Monitoring (Lihat Semua)", icon: FiEye, show: kap.isDPO },

    { href: "/dashboard/berita", label: "Kelola Berita", icon: FiFileText, show: kap.canManageBerita },
    { href: "/dashboard/agenda", label: "Kelola Agenda", icon: FiCalendar, show: kap.canManageEvent },
    { href: "/dashboard/presensi", label: "Presensi Kegiatan", icon: FiCamera, show: kap.canUploadPresensi && kap.role === "PENGURUS" },
    { href: "/dashboard/galeri", label: "Kelola Galeri", icon: FiImage, show: kap.canManageGaleriStruktur },
    { href: "/dashboard/pengurus", label: "Kelola Pengurus", icon: FiUserCheck, show: kap.canManagePengurus },
    { href: "/dashboard/akun", label: "Kelola Akun & Password", icon: FiKey, show: kap.isAdmin },
    { href: "/dashboard/anggota", label: kap.kodeJabatan === "KADIV" ? "Staff Divisi Saya" : "Kelola Anggota", icon: FiUsers, show: kap.canManageAnggota || kap.canManageDivisiStaff },
    { href: "/dashboard/pendaftaran", label: "Pendaftaran Masuk", icon: FiUserPlus, show: kap.canManageAnggota },
    { href: "/dashboard/prestasi", label: "Kelola Prestasi", icon: FiAward, show: kap.canManageGaleriStruktur || kap.isKetuaOrWakil || kap.isAdmin },
    { href: "/dashboard/arsip", label: "Kelola Arsip", icon: FiArchive, show: kap.canManageArsip },
    { href: "/dashboard/file-unduhan", label: "File Unduhan Publik", icon: FiFileText, show: kap.canManageFileUnduhan },
    { href: "/dashboard/keuangan", label: "Kelola Kas & Keuangan", icon: FiDollarSign, show: kap.canManageKeuangan },
    { href: "/dashboard/barang", label: "Kelola Inventaris Barang", icon: FiBox, show: kap.canManageBarang },
    { href: "/dashboard/banner", label: "Kelola Banner", icon: FiLayout, show: kap.canManageProfilWeb },
    { href: "/dashboard/kontak", label: "Pesan Kontak", icon: FiMail, show: kap.canManageKontak },
    { href: "/dashboard/profil-ukm", label: "Ketentuan Website", icon: FiSettings, show: kap.canManageProfilWeb },

    // Menu Anggota / staff
    { href: "/akun-saya", label: "Ringkasan Saya", icon: FiGrid, show: kap.role === "ANGGOTA" },
    { href: "/akun-saya/presensi", label: "Presensi Kegiatan", icon: FiCamera, show: kap.canUploadPresensi && kap.role === "ANGGOTA" },
    { href: "/akun-saya/kas", label: "Kas Saya", icon: FiDollarSign, show: kap.canKelolaKas },
    { href: "/akun-saya/barang", label: "Lapor / Request Barang", icon: FiMessageSquare, show: kap.canKomentarBarang },
  ].filter((m) => m.show);

  const brandLabel = kap.role === "ANGGOTA" ? "UKM Olahraga" : "UKM Admin";

  return (
    <div className="flex min-h-screen bg-surface-lighter dark:bg-surface-dark">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-surface-darkCard border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">{brandLabel}</h2>
        </div>

        {/* View-only badge */}
        {kap.viewOnly && (
          <div className="mx-4 mt-4 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent/30 text-accent text-xs px-3 py-2 font-semibold">
            Mode Lihat Saja ({kap.namaJabatan})
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <m.icon size={18} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Masuk sebagai</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {name.split(" ")[0]}
            <span className="text-primary dark:text-primary-light ml-1 font-normal">({kap.namaJabatan || kap.role})</span>
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <FiLogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-white dark:bg-surface-darkCard border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <FiMenu size={20} />
          </button>
        </div>
        <span className="font-semibold text-slate-900 dark:text-white text-sm">{brandLabel}</span>
        <div className="flex items-center gap-2">
          <Link
            href="/akun-saya/profil"
            aria-label="Profil saya"
            className="h-9 w-9 overflow-hidden rounded-full border border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary-light transition-colors flex items-center justify-center bg-slate-100 dark:bg-white/5"
          >
            {avatar ? (
              <img src={avatar} alt="Foto profil" className="h-full w-full object-cover" />
            ) : (
              <span className="font-semibold text-slate-900 dark:text-white text-sm">{initial}</span>
            )}
          </Link>
          <DarkModeToggle />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-64 h-full bg-white dark:bg-surface-darkCard shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white">{brandLabel}</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <m.icon size={18} />
                  <span>{m.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 w-full"
              >
                <FiLogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-surface-darkCard/50 backdrop-blur-sm">
          <div></div>
          <div className="flex items-center gap-3">
            <Link
              href="/akun-saya/profil"
              aria-label="Profil saya"
              title="Profil saya"
              className="h-9 w-9 overflow-hidden rounded-full border border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary-light transition-colors flex items-center justify-center bg-slate-100 dark:bg-white/5"
            >
              {avatar ? (
                <img src={avatar} alt="Foto profil" className="h-full w-full object-cover" />
              ) : (
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{initial}</span>
              )}
            </Link>
            <DarkModeToggle />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="apple-page p-4 sm:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
