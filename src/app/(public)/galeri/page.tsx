import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const metadata = { title: "Galeri" };

export default async function GaleriPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const kategoriFilter = searchParams.kategori;
  const galeri = await prisma.galeri.findMany({
    where: kategoriFilter ? { kategori: kategoriFilter } : {},
    orderBy: { createdAt: "desc" },
  });
  const kategoriList = await prisma.galeri.findMany({ select: { kategori: true }, distinct: ["kategori"] });

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Dokumentasi</span>
      <h1 className="section-title mb-6">Galeri Kegiatan</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <a href="/galeri" className={`badge ${!kategoriFilter ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>Semua</a>
        {kategoriList.filter((k) => k.kategori).map((k) => (
          <a key={k.kategori} href={`/galeri?kategori=${k.kategori}`} className={`badge ${kategoriFilter === k.kategori ? "bg-primary text-white" : "bg-surface-light dark:bg-white/10"}`}>
            {k.kategori}
          </a>
        ))}
      </div>

      {galeri.length === 0 ? (
        <p className="text-slate-500">Belum ada foto galeri.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galeri.map((g) => (
            <div key={g.id} className="relative aspect-square rounded-xl overflow-hidden bg-surface-light dark:bg-white/5 group">
              <Image src={g.gambar} alt={g.judul} fill className="object-cover group-hover:scale-110 transition duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-end p-3 opacity-0 group-hover:opacity-100">
                <p className="text-white text-xs font-medium">{g.judul}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
