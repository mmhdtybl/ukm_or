import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import ArsipManager from "@/components/admin/ArsipManager";

export const metadata = { title: "Kelola Arsip" };

export default async function KelolaArsipPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageArsip) redirect("/dashboard");

  const arsip = await prisma.arsip.findMany({
    include: { diunggahOleh: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Kelola Arsip</h1>
      <p className="text-slate-500 mb-6">Simpan dan kelola dokumen resmi UKM: surat, notulen rapat, proposal, LPJ, dan lainnya.</p>
      <ArsipManager initialData={JSON.parse(JSON.stringify(arsip))} />
    </div>
  );
}
