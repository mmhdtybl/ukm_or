import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { FiAward } from "react-icons/fi";

export const metadata = { title: "Prestasi" };

export default async function PrestasiPage() {
  const prestasi = await prisma.prestasi.findMany({ orderBy: [{ tahun: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Kebanggaan Kami</span>
      <h1 className="section-title mb-10">Prestasi UKM</h1>

      {prestasi.length === 0 ? (
        <p className="text-slate-500">Belum ada data prestasi.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {prestasi.map((p) => (
            <div key={p.id} className="card">
              <div className="relative h-40 rounded-lg overflow-hidden mb-4 bg-surface-light dark:bg-white/5 grid place-items-center">
                {p.gambar ? <Image src={p.gambar} alt={p.judul} fill className="object-cover" /> : <FiAward size={32} className="text-accent" />}
              </div>
              <span className="badge bg-primary/10 text-primary dark:bg-white/10 dark:text-accent mb-2">{p.tingkat} · {p.tahun}</span>
              <h3 className="font-semibold text-lg mb-1">{p.judul}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Diraih oleh: {p.peraih}</p>
              {p.penyelenggara && <p className="text-xs text-slate-400 mt-1">Penyelenggara: {p.penyelenggara}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
