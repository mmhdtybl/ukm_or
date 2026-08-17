"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
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
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className="
          mx-auto max-w-7xl
          rounded-3xl
          border border-white/60 dark:border-slate-700/60
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur-2xl
          shadow-[0_8px_35px_rgba(15,76,129,0.10)]
          dark:shadow-[0_8px_35px_rgba(0,0,0,0.30)]
        "
      >
        <div className="flex h-[68px] items-center justify-between gap-4 px-4 sm:px-6">

          {/* ================= LOGO ================= */}
          <Link
            href="/"
            className="
              group flex items-center gap-3
              shrink-0
              transition-transform duration-300
              hover:scale-[1.02]
            "
          >
            <div
              className="
                relative h-11 w-11
                overflow-hidden
                rounded-2xl
                bg-white
                p-1
                shadow-md
                ring-1 ring-slate-200/70
                dark:ring-slate-700/70
                transition-all duration-300
                group-hover:shadow-lg
                group-hover:ring-primary/30
              "
            >
              <Image
                src="/branding/logo-ukm.png"
                alt="Logo UKM Olahraga"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                UKM Olahraga
              </div>

              <div className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
                UNIMMA
              </div>
            </div>
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <div className="hidden lg:flex items-center gap-1 rounded-2xl bg-slate-100/70 p-1.5 dark:bg-white/5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative rounded-xl px-3.5 py-2.5
                    text-[13px] font-semibold
                    transition-all duration-300
                    ${
                      isActive
                        ? `
                          bg-white
                          text-primary
                          shadow-sm
                          dark:bg-slate-800
                          dark:text-primary-light
                        `
                        : `
                          text-slate-600
                          hover:bg-white/80
                          hover:text-slate-900
                          dark:text-slate-300
                          dark:hover:bg-white/10
                          dark:hover:text-white
                        `
                    }
                  `}
                >
                  {link.label}

                  {isActive && (
                    <span
                      className="
                        absolute
                        bottom-1
                        left-1/2
                        h-1
                        w-1
                        -translate-x-1/2
                        rounded-full
                        bg-primary
                      "
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ================= DESKTOP ACTIONS ================= */}
          <div className="hidden lg:flex items-center gap-2">

            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-1 dark:border-slate-700/70 dark:bg-white/5">
              <DarkModeToggle />
            </div>

            {session ? (
              <div className="flex items-center gap-2">

                <Link
                  href={
                    session.user.role === "ANGGOTA"
                      ? "/akun-saya"
                      : "/dashboard"
                  }
                  className="
                    flex items-center gap-2
                    rounded-xl
                    bg-primary
                    px-4 py-2.5
                    text-sm font-semibold
                    text-white
                    shadow-md shadow-primary/20
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-primary-dark
                    hover:shadow-lg
                  "
                >
                  <FiUser size={17} />

                  <span>
                    {session.user.name?.split(" ")[0] || "Akun"}
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    text-slate-500
                    transition-all duration-300
                    hover:bg-red-50
                    hover:text-red-600
                    dark:text-slate-300
                    dark:hover:bg-red-500/10
                    dark:hover:text-red-400
                  "
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">

                <Link
                  href="/login"
                  className="
                    rounded-xl
                    px-4 py-2.5
                    text-sm font-semibold
                    text-slate-700
                    transition-all duration-300
                    hover:bg-slate-100
                    dark:text-slate-200
                    dark:hover:bg-white/10
                  "
                >
                  Masuk
                </Link>

                <Link
                  href="/pendaftaran"
                  className="
                    rounded-xl
                    bg-primary
                    px-4 py-2.5
                    text-sm font-semibold
                    text-white
                    shadow-md shadow-primary/20
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-primary-dark
                    hover:shadow-lg
                  "
                >
                  Daftar
                </Link>

              </div>
            )}
          </div>

          {/* ================= MOBILE BUTTON ================= */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-2xl
              border border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition-all duration-300
              hover:bg-slate-50
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:hover:bg-slate-700
              lg:hidden
            "
          >
            {isOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {isOpen && (
          <div className="px-3 pb-3 lg:hidden">

            <div
              className="
                overflow-hidden
                rounded-2xl
                border border-slate-200/70
                bg-slate-50/80
                p-2
                dark:border-slate-700/70
                dark:bg-slate-800/80
              "
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between
                      rounded-xl
                      px-4 py-3
                      text-sm font-semibold
                      transition-all duration-200
                      ${
                        isActive
                          ? `
                            bg-white
                            text-primary
                            shadow-sm
                            dark:bg-slate-700
                            dark:text-primary-light
                          `
                          : `
                            text-slate-600
                            hover:bg-white
                            hover:text-slate-900
                            dark:text-slate-300
                            dark:hover:bg-slate-700
                            dark:hover:text-white
                          `
                      }
                    `}
                  >
                    <span>{link.label}</span>

                    <FiChevronRight
                      size={16}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-slate-400"
                      }
                    />
                  </Link>
                );
              })}

              {/* Mobile Actions */}
              <div
                className="
                  mt-2
                  flex items-center justify-between
                  border-t
                  border-slate-200
                  px-2 pt-3
                  dark:border-slate-700
                "
              >
                <DarkModeToggle />

                {session ? (
                  <div className="flex items-center gap-2">

                    <Link
                      href={
                        session.user.role === "ANGGOTA"
                          ? "/akun-saya"
                          : "/dashboard"
                      }
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-xl
                        bg-primary
                        px-4 py-2.5
                        text-xs font-bold
                        text-white
                      "
                    >
                      {session.user.role === "ANGGOTA"
                        ? "Akun Saya"
                        : "Dashboard"}
                    </Link>

                    <button
                      onClick={() =>
                        signOut({ callbackUrl: "/" })
                      }
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        bg-red-50
                        text-red-600
                        dark:bg-red-500/10
                        dark:text-red-400
                      "
                    >
                      <FiLogOut size={17} />
                    </button>

                  </div>
                ) : (
                  <div className="flex gap-2">

                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-xl
                        border border-slate-200
                        bg-white
                        px-4 py-2.5
                        text-xs font-bold
                        text-slate-700
                        dark:border-slate-600
                        dark:bg-slate-700
                        dark:text-white
                      "
                    >
                      Masuk
                    </Link>

                    <Link
                      href="/pendaftaran"
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-xl
                        bg-primary
                        px-4 py-2.5
                        text-xs font-bold
                        text-white
                        shadow-sm
                      "
                    >
                      Daftar
                    </Link>

                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}