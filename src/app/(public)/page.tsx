import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/utils";
import { FiArrowRight, FiCalendar, FiMapPin, FiAward, FiUsers, FiChevronRight } from "react-icons/fi";

export default async function HomePage() {
  const [profil, banners, berita, agenda, prestasi, jumlahAnggota] = await Promise.all([
    prisma.profilUKM.findFirst(),
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { urutan: "asc" }, take: 5 }),
    prisma.berita.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.agenda.findMany({ where: { tanggalMulai: { gte: new Date() } }, orderBy: { tanggalMulai: "asc" }, take: 3 }),
    prisma.prestasi.findMany({ orderBy: { tahun: "desc" }, take: 3 }),
    prisma.anggota.count({ where: { status: "Aktif" } }),
  ]).catch(() => [null, [], [], [], [], 0] as any);

  const hero = banners?.[0];

  return (
    <div className="overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes glowBannerMove {
          0% {
            box-shadow: 
              0 0 40px rgba(255, 215, 0, 0.4),
              -30px -30px 80px rgba(0, 113, 227, 0.25),
              30px -30px 80px rgba(0, 113, 227, 0.25);
          }
          25% {
            box-shadow: 
              30px 0 40px rgba(255, 215, 0, 0.4),
              -15px -30px 80px rgba(0, 113, 227, 0.35),
              30px 30px 80px rgba(0, 113, 227, 0.25);
          }
          50% {
            box-shadow: 
              0 30px 40px rgba(255, 215, 0, 0.4),
              -30px 0px 80px rgba(0, 113, 227, 0.25),
              30px 0px 80px rgba(0, 113, 227, 0.35);
          }
          75% {
            box-shadow: 
              -30px 0 40px rgba(255, 215, 0, 0.4),
              -30px -30px 80px rgba(0, 113, 227, 0.25),
              15px 30px 80px rgba(0, 113, 227, 0.35);
          }
          100% {
            box-shadow: 
              0 0 40px rgba(255, 215, 0, 0.4),
              -30px -30px 80px rgba(0, 113, 227, 0.25),
              30px -30px 80px rgba(0, 113, 227, 0.25);
          }
        }
        
        @keyframes glowMove {
          0% {
            text-shadow: 
              0 0 20px rgba(255, 215, 0, 0.5),
              0 0 40px rgba(0, 113, 227, 0.3),
              -25px -25px 50px rgba(255, 215, 0, 0.2),
              25px -25px 50px rgba(0, 113, 227, 0.2);
          }
          25% {
            text-shadow: 
              30px 0 25px rgba(255, 215, 0, 0.5),
              0 -30px 40px rgba(0, 113, 227, 0.4),
              -15px 25px 50px rgba(255, 215, 0, 0.2),
              25px 25px 50px rgba(0, 113, 227, 0.2);
          }
          50% {
            text-shadow: 
              0 30px 25px rgba(255, 215, 0, 0.5),
              -30px 0px 40px rgba(0, 113, 227, 0.4),
              -25px -25px 50px rgba(255, 215, 0, 0.2),
              25px 25px 50px rgba(0, 113, 227, 0.2);
          }
          75% {
            text-shadow: 
              -30px 0 25px rgba(255, 215, 0, 0.5),
              0 30px 40px rgba(0, 113, 227, 0.4),
              -25px 25px 50px rgba(255, 215, 0, 0.2),
              25px -25px 50px rgba(0, 113, 227, 0.2);
          }
          100% {
            text-shadow: 
              0 0 20px rgba(255, 215, 0, 0.5),
              0 0 40px rgba(0, 113, 227, 0.3),
              -25px -25px 50px rgba(255, 215, 0, 0.2),
              25px -25px 50px rgba(0, 113, 227, 0.2);
          }
        }
        
        .banner-glow {
          animation: glowBannerMove 5s ease-in-out infinite;
        }
        
        .glow-animated {
          animation: glowMove 4s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-fade-in-scale {
          animation: fadeInScale 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-pop-in {
          animation: popIn 0.4s ease-out;
        }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative bg-white dark:bg-surface-dark pt-10 md:pt-16 pb-12 md:pb-20">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Content */}
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h1 className="section-title mb-4 glow-animated">
                  {hero?.judul || profil?.namaUKM || "UKM Olahraga Unimma"}
                </h1>
                <p className="section-subtitle">
                  {hero?.subjudul || profil?.deskripsi || "Wadah pengembangan minat, bakat, dan prestasi mahasiswa di bidang olahraga dan event."}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/pendaftaran" className="btn-primary group">
                  Daftar Jadi Anggota
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/profil" className="btn-outline">
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-surface-darkCard shadow-lg animate-slide-in-right banner-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 pointer-events-none z-10" />
              {hero?.gambar ? (
                <Image 
                  src={hero.gambar} 
                  alt={hero.judul || "Hero Image"} 
                  fill 
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <span className="text-sm">Banner UKM</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK SECTION */}
      <section className="bg-slate-50 dark:bg-surface-darkCardDeep py-12 md:py-16">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: FiUsers, label: "Anggota Aktif", value: jumlahAnggota || 0 },
              { icon: FiCalendar, label: "Kegiatan", value: "50+" },
              { icon: FiAward, label: "Prestasi", value: "20+" },
              { icon: FiMapPin, label: "Cabang", value: "6" },
            ].map((stat, idx) => (
              <div key={stat.label} className={`card !p-4 md:!p-6 text-center hover:shadow-card transition-shadow animate-fade-in-scale delay-${idx + 1}`}>
                <div className="mx-auto mb-3 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                  <stat.icon size={20} className="md:block" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BERITA TERBARU */}
      <section className="container-page py-16 md:py-20">
        <div className="flex items-end justify-between mb-10 animate-fade-in-up">
          <div>
            <span className="section-eyebrow">Info Terkini</span>
            <h2 className="section-title">Berita Terbaru</h2>
          </div>
          <Link href="/berita" className="link flex items-center gap-1">
            Lihat Semua
            <FiChevronRight size={16} />
          </Link>
        </div>

        {berita.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Belum ada berita yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {berita.map((b: any, idx: number) => (
              <Link key={b.id} href={`/berita/${b.slug}`} className={`card group hover:shadow-card transition-all hover:-translate-y-1 animate-slide-in-left delay-${(idx % 3) + 1}`}>
                <div className="relative h-40 md:h-48 -m-6 mb-4 rounded-t-2xl overflow-hidden bg-slate-100 dark:bg-surface-dark">
                  {b.gambar && (
                    <Image src={b.gambar} alt={b.judul} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="text-xs font-semibold text-primary dark:text-primary-light mb-2">
                  {formatTanggal(b.createdAt)}
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  {b.judul}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{b.ringkasan}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* AGENDA MENDATANG */}
      <section className="bg-slate-50 dark:bg-surface-darkCardDeep py-16 md:py-20">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 animate-fade-in-up">
            <div>
              <span className="section-eyebrow">Jangan Lewatkan</span>
              <h2 className="section-title">Agenda Mendatang</h2>
            </div>
            <Link href="/agenda" className="link flex items-center gap-1">
              Lihat Semua
              <FiChevronRight size={16} />
            </Link>
          </div>

          {agenda.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">Belum ada agenda mendatang.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {agenda.map((a: any, idx: number) => (
                <div key={a.id} className={`card hover:shadow-card transition-all hover:-translate-y-1 animate-pop-in delay-${(idx % 3) + 1}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                      <FiCalendar size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatTanggal(a.tanggalMulai)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{a.judul}</h3>
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <FiMapPin className="flex-shrink-0 mt-0.5" size={14} />
                    <span>{a.lokasi}</span>
                  </div>
                  <Link href={`/agenda#${a.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-primary-light hover:gap-2 transition-all">
                    Detail Kegiatan
                    <FiChevronRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PRESTASI */}
      <section className="container-page py-16 md:py-20">
        <div className="flex items-end justify-between mb-10 animate-fade-in-up">
          <div>
            <span className="section-eyebrow">Kebanggaan Kami</span>
            <h2 className="section-title">Prestasi Terbaru</h2>
          </div>
          <Link href="/prestasi" className="link flex items-center gap-1">
            Lihat Semua
            <FiChevronRight size={16} />
          </Link>
        </div>

        {prestasi.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Belum ada data prestasi.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {prestasi.map((p: any, idx: number) => (
              <div key={p.id} className={`card hover:shadow-card transition-all hover:-translate-y-1 animate-fade-in-up delay-${(idx % 3) + 1}`}>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent dark:bg-accent/20 mb-4">
                  <FiAward size={20} />
                </div>
                <div className="text-xs font-semibold text-primary dark:text-primary-light mb-2">
                  {p.tingkat} · {p.tahun}
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2">{p.judul}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{p.peraih}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA SECTION */}
      <section className="container-page py-16 md:py-20">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-dark p-8 md:p-16 text-white shadow-xl animate-fade-in-up">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -z-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -z-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Bergabunglah dengan Kami</h2>
            <p className="text-white/80 text-lg mb-8">
              Kembangkan minat dan bakat Anda di 6 cabang olahraga bersama UKM Olahraga Unimma. Bergabunglah dengan ribuan anggota aktif kami.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/pendaftaran" className="bg-white text-primary hover:bg-slate-100 font-semibold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2 group">
                Daftar Sekarang
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
              <Link href="/profil" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
