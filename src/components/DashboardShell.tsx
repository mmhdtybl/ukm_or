"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

import {
  FiGrid,
  FiFileText,
  FiCalendar,
  FiImage,
  FiAward,
  FiLayout,
  FiSettings,
  FiMail,
  FiUserPlus,
  FiMenu,
  FiX,
  FiLogOut,
  FiCamera,
  FiArchive,
  FiDollarSign,
  FiBox,
  FiEye,
  FiMessageSquare,
  FiKey,
  FiHome,
  FiChevronRight,
} from "react-icons/fi";

import DarkModeToggle from "./DarkModeToggle";
import type { Kapabilitas } from "@/lib/permissions";

export default function DashboardShell({
  kap,
  name,
  avatar,
  children,
}: {
  kap: Kapabilitas;
  name: string;
  avatar: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // =========================================================
  // USER
  // =========================================================

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  // =========================================================
  // BRAND
  // =========================================================

  const brandLabel = "UKM Olahraga";

  // =========================================================
  // MENU
  // =========================================================

  const menu = [
    {
      href: "/dashboard",
      label: "Statistik",
      icon: FiGrid,
      show: kap.role !== "ANGGOTA",
    },

    {
      href: "/dashboard/monitoring",
      label: "Monitoring",
      icon: FiEye,
      show: kap.isDPO,
    },

    {
      href: "/dashboard/berita",
      label: "Kelola Berita",
      icon: FiFileText,
      show: kap.canManageBerita,
    },

    {
      href: "/dashboard/agenda",
      label: "Kelola Agenda",
      icon: FiCalendar,
      show: kap.canManageEvent,
    },

    {
      href: "/dashboard/presensi",
      label: "Presensi Kegiatan",
      icon: FiCamera,
      show:
        kap.canUploadPresensi &&
        kap.role === "PENGURUS",
    },

    {
      href: "/dashboard/galeri",
      label: "Kelola Galeri",
      icon: FiImage,
      show: kap.canManageGaleriStruktur,
    },

    {
      href: "/dashboard/akun",
      label: "Kelola Akun & Password",
      icon: FiKey,
      show: kap.isAdmin,
    },

    {
      href: "/dashboard/pendaftaran",
      label: "Pendaftaran Masuk",
      icon: FiUserPlus,
      show: kap.canManageAnggota,
    },

    {
      href: "/dashboard/prestasi",
      label: "Kelola Prestasi",
      icon: FiAward,
      show:
        kap.canManageGaleriStruktur ||
        kap.isKetuaOrWakil ||
        kap.isAdmin,
    },

    {
      href: "/dashboard/arsip",
      label: "Kelola Arsip",
      icon: FiArchive,
      show: kap.canManageArsip,
    },

    {
      href: "/dashboard/file-unduhan",
      label: "File Unduhan Publik",
      icon: FiFileText,
      show: kap.canManageFileUnduhan,
    },

    {
      href: "/dashboard/keuangan",
      label: "Kelola Kas & Keuangan",
      icon: FiDollarSign,
      show: kap.canManageKeuangan,
    },

    {
      href: "/dashboard/barang",
      label: "Kelola Inventaris Barang",
      icon: FiBox,
      show: kap.canManageBarang,
    },

    {
      href: "/dashboard/banner",
      label: "Kelola Banner",
      icon: FiLayout,
      show: kap.canManageProfilWeb,
    },

    {
      href: "/dashboard/kontak",
      label: "Laporan Pengguna",
      icon: FiMail,
      show: kap.canManageKontak,
    },

    {
      href: "/dashboard/profil-ukm",
      label: "Ketentuan Website",
      icon: FiSettings,
      show: kap.canManageProfilWeb,
    },

    // =======================================================
    // ANGGOTA
    // =======================================================

    {
      href: "/akun-saya",
      label: "Ringkasan Saya",
      icon: FiGrid,
      show: kap.role === "ANGGOTA",
    },

    {
      href: "/akun-saya/presensi",
      label: "Presensi Kegiatan",
      icon: FiCamera,
      show:
        kap.canUploadPresensi &&
        kap.role === "ANGGOTA",
    },

    {
      href: "/akun-saya/kas",
      label: "Kas Saya",
      icon: FiDollarSign,
      show: !kap.isAdmin && !kap.isDPO,
    },

    {
      href: "/akun-saya/barang",
      label: "Lapor / Request Barang",
      icon: FiMessageSquare,
      show: kap.canKomentarBarang,
    },
  ].filter((m) => m.show);

  // =========================================================
  // MENU COMPONENT
  // =========================================================

  const MenuItems = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => {
    return (
      <nav
        className={
          mobile
            ? "space-y-1 p-3"
            : "space-y-1 px-3 py-5"
        }
      >
        {menu.map((m) => {
          const Icon = m.icon;

          const active =
            pathname === m.href ||
            (m.href !== "/dashboard" &&
              pathname.startsWith(`${m.href}/`));

          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => {
                if (mobile) {
                  setOpen(false);
                }
              }}
              className={`
                group relative flex items-center gap-3
                rounded-2xl px-3 py-2.5
                text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? `
                      bg-primary/90
                      text-white
                      shadow-lg
                      shadow-primary/20
                      backdrop-blur-xl
                    `
                    : `
                      text-slate-600
                      dark:text-slate-300
                      hover:bg-white/70
                      dark:hover:bg-white/[0.08]
                      hover:text-primary
                      dark:hover:text-white
                    `
                }
              `}
            >
              {/* ACTIVE INDICATOR */}
              {active && (
                <span
                  className="
                    absolute
                    left-0
                    top-1/2
                    h-6
                    w-1
                    -translate-y-1/2
                    rounded-r-full
                    bg-white/90
                  "
                />
              )}

              {/* ICON */}
              <span
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition-all
                  ${
                    active
                      ? "bg-white/15 text-white"
                      : `
                        bg-slate-100/80
                        dark:bg-white/[0.06]
                        group-hover:bg-primary/10
                        dark:group-hover:bg-white/10
                      `
                  }
                `}
              >
                <Icon size={17} />
              </span>

              {/* LABEL */}
              <span className="min-w-0 flex-1 truncate">
                {m.label}
              </span>

              {/* CHEVRON */}
              {active && (
                <FiChevronRight
                  size={15}
                  className="shrink-0 opacity-70"
                />
              )}
            </Link>
          );
        })}
      </nav>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-100/80
        p-2
        sm:p-3
        lg:p-4
        dark:bg-slate-950/90
      "
    >
      {/* =====================================================
          MAIN GLASS CONTAINER
      ===================================================== */}

      <div
        className="
          flex
          min-h-[calc(100vh-1rem)]
          sm:min-h-[calc(100vh-1.5rem)]
          lg:min-h-[calc(100vh-2rem)]

          overflow-hidden

          rounded-[28px]
          sm:rounded-[32px]

          border
          border-white/70
          dark:border-white/10

          bg-white/45
          dark:bg-white/[0.035]

          shadow-[0_20px_80px_rgba(15,23,42,0.10)]
          dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]

          backdrop-blur-3xl
        "
      >
        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}

        <aside
          className="
            hidden
            lg:flex
            w-72
            shrink-0
            flex-col

            border-r
            border-white/60
            dark:border-white/10

            bg-white/40
            dark:bg-white/[0.025]

            backdrop-blur-3xl
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <div
            className="
              flex
              h-24
              shrink-0
              items-center
              px-5

              border-b
              border-white/60
              dark:border-white/10
            "
          >
            <Link
              href="/dashboard"
              className="
                group
                flex
                items-center
                gap-3
              "
            >
              {/* LOGO */}

             <div
  className="
    relative
    h-12
    w-12
    shrink-0
    overflow-hidden
    rounded-[50px]

   

    shadow-xl
    shadow-primary/20

    backdrop-blur-xl
  "
>
  <img
    src="/branding/logo-ukm.png"
    alt="Logo UKM Olahraga"
    className="h-full w-full object-contain"
  />
</div>

              {/* BRAND TEXT */}

              <div className="min-w-0">
                <h2
                  className="
                    truncate
                    text-base
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {brandLabel}
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-slate-400
                  "
                >
                  Dashboard
                </p>
              </div>
            </Link>
          </div>

          {/* =================================================
              VIEW ONLY
          ================================================= */}

          {kap.viewOnly && (
            <div className="px-4 pt-4">
              <div
                className="
                  rounded-2xl

                  border
                  border-accent/20

                  bg-accent/10

                  px-3
                  py-3

                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-xl
                      bg-accent/15
                      text-accent
                    "
                  >
                    <FiEye size={15} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-accent">
                      Mode Lihat Saja
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-accent/70">
                      {kap.namaJabatan}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              MENU
          ================================================= */}

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <MenuItems />
          </div>

          {/* =================================================
              USER FOOTER
          ================================================= */}

          <div
            className="
              shrink-0
              border-t
              border-white/60
              p-4
              dark:border-white/10
            "
          >
            <div
              className="
                rounded-[22px]

                border
                border-white/70
                dark:border-white/10

                bg-white/60
                dark:bg-white/[0.05]

                p-3

                shadow-sm

                backdrop-blur-2xl
              "
            >
              {/* USER INFO */}

              <div className="flex items-center gap-3">
                <Link
                  href="/akun-saya/profil"
                  className="
                    h-11
                    w-11
                    shrink-0
                    overflow-hidden
                    rounded-full

                    border
                    border-white/80
                    dark:border-white/10

                    bg-white/80
                    dark:bg-white/10

                    shadow-sm
                  "
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Foto profil"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <span
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center

                        bg-primary

                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {initial}
                    </span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {name}
                  </p>

                  <p
                    className="
                      truncate
                      text-[11px]
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {kap.namaJabatan || kap.role}
                  </p>
                </div>
              </div>

              {/* USER ACTION */}

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/akun-saya/profil"
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2

                    rounded-2xl

                    bg-white/80
                    dark:bg-white/[0.08]

                    px-3
                    py-2.5

                    text-xs
                    font-medium

                    text-slate-600
                    dark:text-slate-300

                    shadow-sm

                    backdrop-blur-xl

                    transition

                    hover:bg-white
                    dark:hover:bg-white/[0.13]
                  "
                >
                  <FiSettings size={14} />
                  Profil
                </Link>

                <button
                  onClick={() =>
                    signOut({
                      callbackUrl: "/",
                    })
                  }
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-2xl

                    bg-red-500/10
                    text-red-500

                    backdrop-blur-xl

                    transition

                    hover:bg-red-500/20
                  "
                  title="Keluar"
                >
                  <FiLogOut size={15} />
                </button>
              </div>
            </div>

            {/* WEBSITE LINK */}

            <Link
              href="/"
              className="
                mt-3
                flex
                items-center
                justify-center
                gap-2

                rounded-2xl

                py-2.5

                text-xs
                font-medium

                text-slate-500
                dark:text-slate-400

                transition

                hover:bg-white/50
                hover:text-primary

                dark:hover:bg-white/5
                dark:hover:text-white
              "
            >
              <FiHome size={14} />
              Kembali ke Website
            </Link>
          </div>
        </aside>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* =================================================
              MOBILE HEADER
          ================================================= */}

          <header
            className="
              fixed
              inset-x-2
              top-2
              z-40

              flex
              h-14
              items-center
              justify-between

              rounded-2xl

              border
              border-white/70
              dark:border-white/10

              bg-white/70
              dark:bg-slate-900/70

              px-3

              shadow-lg
              shadow-black/5

              backdrop-blur-2xl

              lg:hidden
            "
          >
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setOpen(true)}
                aria-label="Buka menu"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center

                  rounded-xl

                  text-slate-600
                  dark:text-slate-300

                  transition

                  hover:bg-slate-100
                  dark:hover:bg-white/10
                "
              >
                <FiMenu size={20} />
              </button>

              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center

                    rounded-xl

                    bg-primary
                    text-white

                    shadow-md
                    shadow-primary/20
                  "
                >
                  <FiAward size={16} />
                </div>

                <span
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {brandLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/akun-saya/profil"
                aria-label="Profil saya"
                className="
                  h-9
                  w-9
                  overflow-hidden
                  rounded-full

                  border
                  border-white
                  dark:border-white/10

                  bg-white/70
                  dark:bg-white/10

                  shadow-sm
                "
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center

                      text-xs
                      font-bold

                      text-slate-700
                      dark:text-white
                    "
                  >
                    {initial}
                  </span>
                )}
              </Link>

              <DarkModeToggle />
            </div>
          </header>

          {/* =================================================
              MOBILE SIDEBAR
          ================================================= */}

          {open && (
            <div
              className="
                fixed
                inset-0
                z-50

                bg-black/30
                backdrop-blur-md

                lg:hidden
              "
              onClick={() => setOpen(false)}
            >
              <aside
                className="
                  flex
                  h-full
                  w-[300px]
                  flex-col

                  border-r
                  border-white/70
                  dark:border-white/10

                  bg-white/75
                  dark:bg-slate-900/80

                  shadow-2xl

                  backdrop-blur-3xl
                "
                onClick={(e) => e.stopPropagation()}
              >
                {/* MOBILE BRAND */}

                <div
                  className="
                    flex
                    h-20
                    shrink-0
                    items-center
                    justify-between

                    border-b
                    border-white/70
                    px-4

                    dark:border-white/10
                  "
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center

                        rounded-[17px]

                        bg-primary
                        text-white

                        shadow-lg
                        shadow-primary/20
                      "
                    >
                      <FiAward size={20} />
                    </div>

                    <div>
                      <h3
                        className="
                          font-bold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {brandLabel}
                      </h3>

                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-widest
                          text-slate-400
                        "
                      >
                        Dashboard
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Tutup menu"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center

                      rounded-xl

                      text-slate-500

                      transition

                      hover:bg-slate-100
                      dark:hover:bg-white/10
                    "
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* MOBILE MENU */}

                <div className="flex-1 overflow-y-auto">
                  <MenuItems mobile />
                </div>

                {/* MOBILE FOOTER */}

                <div
                  className="
                    shrink-0
                    border-t
                    border-white/70
                    p-4

                    dark:border-white/10
                  "
                >
                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      gap-3

                      rounded-2xl

                      border
                      border-white/70
                      dark:border-white/10

                      bg-white/60
                      dark:bg-white/[0.05]

                      p-3

                      backdrop-blur-xl
                    "
                  >
                    <div
                      className="
                        h-10
                        w-10
                        shrink-0
                        overflow-hidden
                        rounded-full
                      "
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Foto profil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center

                            bg-primary

                            text-sm
                            font-bold
                            text-white
                          "
                        >
                          {initial}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {name}
                      </p>

                      <p className="truncate text-[11px] text-slate-500">
                        {kap.namaJabatan || kap.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2

                        rounded-2xl

                        bg-white/70
                        dark:bg-white/[0.06]

                        py-2.5

                        text-xs
                        font-medium

                        text-slate-600
                        dark:text-slate-300

                        backdrop-blur-xl
                      "
                    >
                      <FiHome size={14} />
                      Website
                    </Link>

                    <button
                      onClick={() =>
                        signOut({
                          callbackUrl: "/",
                        })
                      }
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center

                        rounded-2xl

                        bg-red-500/10
                        text-red-500

                        backdrop-blur-xl
                      "
                    >
                      <FiLogOut size={15} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* =================================================
              DESKTOP HEADER
          ================================================= */}

          <header
            className="
              hidden
              h-[76px]
              shrink-0
              items-center
              justify-between

              border-b
              border-white/60

              bg-white/35

              px-8

              backdrop-blur-2xl

              dark:border-white/10
              dark:bg-white/[0.02]

              lg:flex
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                "
              >
                Sistem Informasi
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                {brandLabel}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* USER */}

              <Link
                href="/akun-saya/profil"
                aria-label="Profil saya"
                className="
                  group
                  flex
                  items-center
                  gap-2.5

                  rounded-2xl

                  px-2
                  py-1.5

                  transition

                  hover:bg-white/60
                  dark:hover:bg-white/5
                "
              >
                <div
                  className="
                    h-10
                    w-10
                    overflow-hidden
                    rounded-full

                    border
                    border-white/80
                    dark:border-white/10

                    bg-white/70
                    dark:bg-white/10

                    shadow-sm
                  "
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center

                        bg-primary

                        text-xs
                        font-bold
                        text-white
                      "
                    >
                      {initial}
                    </span>
                  )}
                </div>

                <div className="hidden text-left xl:block">
                  <p
                    className="
                      max-w-[180px]
                      truncate

                      text-xs
                      font-semibold

                      text-slate-800
                      dark:text-white
                    "
                  >
                    {name}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {kap.namaJabatan || kap.role}
                  </p>
                </div>
              </Link>

              <DarkModeToggle />
            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main
            className="
              min-h-0
              flex-1
              overflow-auto
            "
          >
            <div
              className="
                apple-page
                mx-auto
                w-full
                max-w-7xl

                p-4
                pt-20

                sm:p-6
                sm:pt-20

                lg:p-8
              "
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
