import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { FiUser } from "react-icons/fi";

export const metadata = { title: "Struktur Organisasi" };

const KELOMPOK_URUTAN = ["DPO", "Inti", "Bidang", "Kadiv", "Lainnya"];
const KELOMPOK_LABEL: Record<string, string> = {
  DPO: "Dewan Pertimbangan Organisasi (DPO)",
  Inti: "Pengurus Inti",
  Bidang: "Bidang",
  Kadiv: "Kepala Divisi Olahraga",
  Lainnya: "Lainnya",
};

function KartuPengurus({ p }: { p: any }) {
  return (
    <div className="card text-center">
      <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden bg-surface-light dark:bg-white/10 mb-4 grid place-items-center">
        {p.foto ? <Image src={p.foto} alt={p.nama} fill className="object-cover" /> : <FiUser size={32} className="text-slate-400" />}
      </div>
      <h3 className="font-semibold">{p.nama}</h3>
      <p className="text-xs text-accent font-semibold">{p.jabatan}</p>
      {p.divisi && <p className="text-xs text-slate-500 mt-1">{p.divisi}</p>}
    </div>
  );
}

export default async function StrukturPage() {
  const pengurus = await prisma.pengurus.findMany({
    where: { isActive: true },
    orderBy: { urutan: "asc" },
  });

  const grouped = KELOMPOK_URUTAN.map((k) => ({
    kelompok: k,
    anggota: pengurus.filter((p) => (p.kelompok || "Lainnya") === k),
  })).filter((g) => g.anggota.length > 0);

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Kepengurusan</span>
      <h1 className="section-title mb-10">Struktur Organisasi {pengurus[0]?.periodeMulai ? `(${pengurus[0].periodeMulai}${pengurus[0].periodeAkhir ? ` – ${pengurus[0].periodeAkhir}` : ""})` : ""}</h1>

      {pengurus.length === 0 ? (
        <p className="text-slate-500">Data pengurus belum tersedia.</p>
      ) : (
        <div className="space-y-12">
          {grouped.map((g) => (
            <div key={g.kelompok}>
              <h2 className="font-semibold text-lg mb-5 text-primary dark:text-accent border-l-4 border-accent pl-3">
                {KELOMPOK_LABEL[g.kelompok] || g.kelompok}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {g.anggota.map((p) => <KartuPengurus key={p.id} p={p} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
