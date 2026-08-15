import { prisma } from "@/lib/prisma";
import { FiTarget, FiCompass } from "react-icons/fi";

export const metadata = { title: "Visi & Misi" };

export default async function VisiMisiPage() {
  const profil = await prisma.profilUKM.findFirst();
  const misiList = (profil?.misi || "").split("\n").filter(Boolean);

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Arah Organisasi</span>
      <h1 className="section-title mb-10">Visi & Misi</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-accent mb-4">
            <FiCompass size={22} />
          </div>
          <h2 className="font-semibold text-xl mb-3">Visi</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profil?.visi || "Belum ditentukan."}</p>
        </div>
        <div className="card">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent mb-4">
            <FiTarget size={22} />
          </div>
          <h2 className="font-semibold text-xl mb-3">Misi</h2>
          <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside">
            {misiList.length > 0 ? misiList.map((m, i) => <li key={i}>{m.replace(/^\d+\.\s*/, "")}</li>) : <li>Belum ditentukan.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}
