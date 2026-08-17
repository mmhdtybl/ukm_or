import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/utils";
import {
  FiArrowRight,
  FiCalendar,
  FiMapPin,
  FiAward,
  FiUsers,
  FiChevronRight,
} from "react-icons/fi";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";

// Penting:
// Membuat Home selalu mengambil data terbaru dari database,
// termasuk banner yang baru ditambahkan admin.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
  profil,
  banners,
  berita,
  agenda,
  prestasi,
  jumlahAnggota,
  jumlahBerita,
  jumlahAgenda,
  jumlahPrestasi,
] = await Promise.all([
  prisma.profilUKM.findFirst(),

  prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { urutan: "asc" },
    take: 5,
  }),

  prisma.berita.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  }),

  prisma.agenda.findMany({
    where: {
      tanggalMulai: {
        gte: new Date(),
      },
    },
    orderBy: {
      tanggalMulai: "asc",
    },
    take: 3,
  }),

  prisma.prestasi.findMany({
    orderBy: {
      tahun: "desc",
    },
    take: 3,
  }),

  // Jumlah anggota aktif
  prisma.anggota.count({
    where: {
      status: "Aktif",
    },
  }),

  // Jumlah berita yang sudah dipublikasikan
  prisma.berita.count({
    where: {
      isPublished: true,
    },
  }),

  // Jumlah seluruh agenda
  prisma.agenda.count(),

  // Jumlah seluruh prestasi
  prisma.prestasi.count(),
]).catch(() => [null, [], [], [], [], 0, 0, 0, 0] as any);

  const hero = banners?.[0];

  return (
    <div className="overflow-x-hidden">

      {/* =========================================================
          CUSTOM ANIMATION
      ========================================================= */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes floating {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulseSoft {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out both;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.6s ease-out both;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out both;
        }

        .animate-pop-in {
          animation: popIn 0.6s ease-out both;
        }

        .animate-floating {
          animation: floating 4s ease-in-out infinite;
        }

        .animate-pulse-soft {
          animation: pulseSoft 3s ease-in-out infinite;
        }

        .delay-1 {
          animation-delay: 0.1s;
        }

        .delay-2 {
          animation-delay: 0.2s;
        }

        .delay-3 {
          animation-delay: 0.3s;
        }

        .delay-4 {
          animation-delay: 0.4s;
        }

        .delay-5 {
          animation-delay: 0.5s;
        }

        .delay-6 {
          animation-delay: 0.6s;
        }

        .hero-grid {
          background-image:
            linear-gradient(
              rgba(15, 76, 129, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(15, 76, 129, 0.035) 1px,
              transparent 1px
            );
          background-size: 45px 45px;
        }
      `}</style>


      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-white dark:bg-surface-dark">

        {/* Grid background */}
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-20" />

        {/* Decorative blur */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-blue-400/5 blur-3xl" />

        <div className="container-page relative">

          <div className="grid min-h-[650px] items-center gap-12 py-12 md:grid-cols-[0.95fr_1.05fr] md:gap-16 md:py-20">

            {/* =====================================================
                HERO CONTENT
            ===================================================== */}
            <div className="relative z-10 animate-fade-in-up">

              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">

                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                </span>

                UNIT KEGIATAN MAHASISWA
              </div>


              {/* Title */}
              <h1 className="mb-6 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
              UKM Olahraga Unimma
              </h1>


              {/* Accent */}
              <div className="mb-7 flex items-center gap-2">

                <div className="h-1.5 w-16 rounded-full bg-blue-600" />

                <div className="h-1.5 w-7 rounded-full bg-yellow-400" />

                <div className="h-1.5 w-2 rounded-full bg-blue-600" />

              </div>


              {/* Description */}
              <p className="mb-8 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">

                {hero?.subjudul ||
                  profil?.deskripsi ||
                  "Wadah pengembangan minat, bakat, dan prestasi mahasiswa di bidang olahraga dan event."}

              </p>


              {/* Buttons */}
              <div className="flex flex-wrap gap-4">

                <Link
                  href="/pendaftaran"
                  className="group inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
                >

                  Daftar Jadi Anggota

                  <FiArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </Link>


                <Link
                  href="/profil"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >

                  Kenali Kami

                </Link>

              </div>


              {/* Mini information */}
              <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-6 dark:border-slate-700 md:gap-7">

                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    6+
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    Cabang Olahraga
                  </div>
                </div>


                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />


                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    Aktif
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    Dalam Kegiatan
                  </div>
                </div>


                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />


                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    UNIMMA
                  </div>

                  <div className="max-w-[180px] text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    Universitas Muhammadiyah Magelang
                  </div>
                </div>

              </div>

            </div>


            {/* =====================================================
                HERO BANNER
            ===================================================== */}
            <div className="relative z-10 animate-slide-in-right">

              {/* Outer glow */}
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-blue-500/20 via-transparent to-yellow-400/20 blur-2xl" />


              {/* Main banner */}
              <div className="group relative h-[320px] overflow-hidden rounded-[2rem] border border-white/70 bg-slate-100 shadow-2xl shadow-blue-900/10 dark:border-slate-700 dark:bg-surface-darkCard sm:h-[390px] md:h-[470px]">

                {/* Top glass bar */}
                <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between rounded-xl border border-white/30 bg-black/20 px-4 py-3 backdrop-blur-md">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">

                    <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />

                    UKM Olahraga

                  </div>


                  <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">

                    unimma

                  </div>

                </div>


                {/* Banner Carousel */}
                <HomeBannerCarousel banners={banners} />


                {/* Bottom gradient */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              </div>


              {/* Floating info card */}
              <div className="animate-floating absolute -bottom-6 -left-5 hidden rounded-2xl border border-white/70 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 sm:block">

                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ayo Bergabung 
                </div>

                <div className="mt-1 font-bold text-slate-900 dark:text-white">
                  Keluarga UKM Olahraga
                </div>

              </div>


              {/* Trophy decoration */}
              <div className="animate-pulse-soft absolute -right-4 -top-5 hidden h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg shadow-yellow-400/30 sm:flex">

                <Image
                src="/branding/logo-ukm.png"
                alt="Logo UKM Olahraga"
                width={42}
                height={42}
                className="object-contain"
                />

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          STATISTIK SECTION
      ========================================================= */}
      <section className="bg-slate-50 py-12 dark:bg-surface-darkCardDeep md:py-16">

        <div className="container-page">

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">

            {[
              {
                icon: FiUsers,
                label: "Anggota Aktif",
                value: jumlahAnggota || 0,
              },
              {
                icon: FiCalendar,
                label: "Kegiatan",
                value: jumlahAgenda || 0,
              },
              {
                icon: FiAward,
                label: "Prestasi",
                value: jumlahPrestasi,
              },
              {
                icon: FiMapPin,
                label: "Cabang",
                value: "6 ",
              },
            ].map((stat, idx) => (

              <div
                key={stat.label}
                className={`card !p-4 text-center transition-all hover:-translate-y-1 hover:shadow-card animate-fade-in-scale delay-${idx + 1} md:!p-6`}
              >

                <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light md:h-12 md:w-12">

                  <stat.icon size={20} />

                </div>


                <div className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">

                  {stat.value}

                </div>


                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 md:text-sm">

                  {stat.label}

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================================================
          BERITA TERBARU
      ========================================================= */}
      <section className="container-page py-16 md:py-20">

        <div className="mb-10 flex items-end justify-between animate-fade-in-up">

          <div>

            <span className="section-eyebrow">
              Info Terkini
            </span>

            <h2 className="section-title">
              Berita Terbaru
            </h2>

          </div>


          <Link
            href="/berita"
            className="link flex items-center gap-1"
          >

            Lihat Semua

            <FiChevronRight size={16} />

          </Link>

        </div>


        {berita.length === 0 ? (

          <div className="py-12 text-center">

            <p className="text-slate-500 dark:text-slate-400">
              Belum ada berita yang dipublikasikan.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-3">

            {berita.map((b: any, idx: number) => (

              <Link
                key={b.id}
                href={`/berita/${b.slug}`}
                className={`card group transition-all hover:-translate-y-1 hover:shadow-card animate-slide-in-right delay-${(idx % 3) + 1}`}
              >

                {/* Image */}
                <div className="relative -m-6 mb-4 h-40 overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-surface-dark md:h-48">

                  {b.gambar ? (

                    <Image
                      src={b.gambar}
                      alt={b.judul}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Tidak ada gambar
                    </div>

                  )}

                </div>


                {/* Date */}
                <div className="mb-2 text-xs font-semibold text-primary dark:text-primary-light">

                  {formatTanggal(b.createdAt)}

                </div>


                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary dark:group-hover:text-primary-light md:text-lg">

                  {b.judul}

                </h3>


                {/* Summary */}
                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">

                  {b.ringkasan}

                </p>

              </Link>

            ))}

          </div>

        )}

      </section>


      {/* =========================================================
          AGENDA MENDATANG
      ========================================================= */}
      <section className="bg-slate-50 py-16 dark:bg-surface-darkCardDeep md:py-20">

        <div className="container-page">

          <div className="mb-10 flex items-end justify-between animate-fade-in-up">

            <div>

              <span className="section-eyebrow">
                Jangan Lewatkan
              </span>

              <h2 className="section-title">
                Agenda Mendatang
              </h2>

            </div>


            <Link
              href="/agenda"
              className="link flex items-center gap-1"
            >

              Lihat Semua

              <FiChevronRight size={16} />

            </Link>

          </div>


          {agenda.length === 0 ? (

            <div className="py-12 text-center">

              <p className="text-slate-500 dark:text-slate-400">
                Belum ada agenda mendatang.
              </p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-3">

              {agenda.map((a: any, idx: number) => (

                <div
                  key={a.id}
                  className={`card transition-all hover:-translate-y-1 hover:shadow-card animate-pop-in delay-${(idx % 3) + 1}`}
                >

                  {/* Date */}
                  <div className="mb-4 flex items-center gap-2">

                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">

                      <FiCalendar size={16} />

                    </div>


                    <span className="text-sm font-semibold text-slate-900 dark:text-white">

                      {formatTanggal(a.tanggalMulai)}

                    </span>

                  </div>


                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold">

                    {a.judul}

                  </h3>


                  {/* Location */}
                  <div className="mb-4 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">

                    <FiMapPin
                      className="mt-0.5 flex-shrink-0"
                      size={14}
                    />

                    <span>
                      {a.lokasi}
                    </span>

                  </div>


                  {/* Detail */}
                  <Link
                    href={`/agenda#${a.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:gap-2 dark:text-primary-light"
                  >

                    Detail Kegiatan

                    <FiChevronRight size={16} />

                  </Link>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =========================================================
          PRESTASI
      ========================================================= */}
      <section className="container-page py-16 md:py-20">

        <div className="mb-10 flex items-end justify-between animate-fade-in-up">

          <div>

            <span className="section-eyebrow">
              Kebanggaan Kami
            </span>

            <h2 className="section-title">
              Prestasi Terbaru
            </h2>

          </div>


          <Link
            href="/prestasi"
            className="link flex items-center gap-1"
          >

            Lihat Semua

            <FiChevronRight size={16} />

          </Link>

        </div>


        {prestasi.length === 0 ? (

          <div className="py-12 text-center">

            <p className="text-slate-500 dark:text-slate-400">
              Belum ada data prestasi.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-3">

            {prestasi.map((p: any, idx: number) => (

              <div
                key={p.id}
                className={`card transition-all hover:-translate-y-1 hover:shadow-card animate-fade-in-up delay-${(idx % 3) + 1}`}
              >

                {/* Icon */}
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent dark:bg-accent/20">

                  <FiAward size={20} />

                </div>


                {/* Level & Year */}
                <div className="mb-2 text-xs font-semibold text-primary dark:text-primary-light">

                  {p.tingkat} · {p.tahun}

                </div>


                {/* Title */}
                <h3 className="mb-2 text-base font-semibold md:text-lg">

                  {p.judul}

                </h3>


                {/* Winner */}
                <p className="text-sm text-slate-600 dark:text-slate-400">

                  {p.peraih}

                </p>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <section className="container-page py-16 md:py-20">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark p-8 text-white shadow-2xl md:p-16">

          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />


          {/* Decorative circle */}
          <div className="pointer-events-none absolute right-10 top-10 hidden h-24 w-24 rounded-full border border-white/10 md:block" />

          <div className="pointer-events-none absolute right-20 top-20 hidden h-10 w-10 rounded-full bg-yellow-400/30 blur-xl md:block" />


          <div className="relative z-10 max-w-2xl">

            <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">

              Mari Berkembang Bersama

            </span>


            <h2 className="mb-4 text-3xl font-bold md:text-4xl">

              Bergabunglah dengan Kami

            </h2>


            <p className="mb-8 text-lg leading-8 text-white/80">

              Kembangkan minat dan bakat Anda di 6 cabang olahraga bersama UKM Olahraga Unimma. Bergabunglah dan jadilah bagian dari keluarga kami.

            </p>


            <div className="flex flex-wrap gap-4">

              <Link
                href="/pendaftaran"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition-all hover:-translate-y-1 hover:bg-slate-100"
              >

                Daftar Sekarang

                <FiArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  size={18}
                />

              </Link>


              <Link
                href="/profil"
                className="inline-flex items-center rounded-xl border-2 border-white/80 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-white/10"
              >

                Pelajari Lebih Lanjut

              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}