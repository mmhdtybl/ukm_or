import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatTanggal } from "@/lib/utils";
import { FiSearch } from "react-icons/fi";

export const metadata = { title: "Berita" };

export default async function BeritaPage({ searchParams }: { searchParams: { q?: string; kategori?: string } }) {
  const q = searchParams.q || "";
  const kategori = searchParams.kategori;

  const [berita, kategoriList] = await Promise.all([
    prisma.berita.findMany({
      where: {
        isPublished: true,
        ...(q ? { OR: [{ judul: { contains: q } }, { ringkasan: { contains: q } }] } : {}),
        ...(kategori ? { kategori: { slug: kategori } } : {}),
      },
      include: { kategori: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.kategoriBerita.findMany(),
  ]);

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Info & Publikasi</span>
      <h1 className="section-title mb-6">Berita UKM</h1>

      <form className="flex flex-col sm:flex-row gap-3 mb-8" action="/berita">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" name="q" defaultValue={q} placeholder="Cari berita..." className="input pl-10" />
        </div>
        <button className="btn-primary !py-2.5">Cari</button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/berita" className={`badge ${!kategori ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>Semua</Link>
        {kategoriList.map((k) => (
          <Link key={k.id} href={`/berita?kategori=${k.slug}`} className={`badge ${kategori === k.slug ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>
            {k.nama}
          </Link>
        ))}
      </div>

      {berita.length === 0 ? (
        <p className="text-slate-500">Tidak ada berita ditemukan.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {berita.map((b) => (
            <Link key={b.id} href={`/berita/${b.slug}`} className="card group block">
              <div className="relative h-44 rounded-lg overflow-hidden mb-4 bg-surface-light dark:bg-white/5">
                {b.gambar && <Image src={b.gambar} alt={b.judul} fill className="object-cover group-hover:scale-105 transition" />}
              </div>
              {b.kategori && <span className="badge bg-accent/15 text-accent mb-2">{b.kategori.nama}</span>}
              <div className="text-xs text-slate-400 mb-1">{formatTanggal(b.createdAt)}</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary dark:group-hover:text-accent line-clamp-2">{b.judul}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{b.ringkasan}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
