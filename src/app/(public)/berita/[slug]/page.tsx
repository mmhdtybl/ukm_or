import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTanggalWaktu } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const berita = await prisma.berita.findUnique({ where: { slug: params.slug } });
  return { title: berita?.judul || "Berita" };
}

export default async function DetailBeritaPage({ params }: { params: { slug: string } }) {
  const berita = await prisma.berita.findUnique({
    where: { slug: params.slug },
    include: { kategori: true, penulis: true },
  });

  if (!berita || !berita.isPublished) notFound();

  await prisma.berita.update({ where: { id: berita.id }, data: { dilihat: { increment: 1 } } });

  const beritaLain = await prisma.berita.findMany({
    where: { isPublished: true, id: { not: berita.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="container-page py-16">
      <div className="grid md:grid-cols-3 gap-10">
        <article className="md:col-span-2">
          {berita.kategori && <span className="badge bg-accent/15 text-accent mb-3">{berita.kategori.nama}</span>}
          <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-3">{berita.judul}</h1>
          <div className="text-sm text-slate-400 mb-6">
            {formatTanggalWaktu(berita.createdAt)} · {berita.penulis?.name || "Admin"} · {berita.dilihat} dibaca
          </div>
          {berita.gambar && (
            <div className="relative h-72 md:h-96 rounded-xl2 overflow-hidden mb-8">
              <Image src={berita.gambar} alt={berita.judul} fill className="object-cover" />
            </div>
          )}
          <div className="prose dark:prose-invert max-w-none whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-200">
            {berita.konten}
          </div>
        </article>

        <aside>
          <h3 className="font-semibold mb-4 text-primary dark:text-accent">Berita Lainnya</h3>
          <div className="space-y-4">
            {beritaLain.map((b) => (
              <Link key={b.id} href={`/berita/${b.slug}`} className="flex gap-3 group">
                <div className="relative h-16 w-20 shrink-0 rounded-lg overflow-hidden bg-surface-light dark:bg-white/5">
                  {b.gambar && <Image src={b.gambar} alt={b.judul} fill className="object-cover" />}
                </div>
                <h4 className="text-sm font-medium group-hover:text-primary dark:group-hover:text-accent line-clamp-3">{b.judul}</h4>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
