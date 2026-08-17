import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import PengurusManager from "@/components/admin/PengurusManager";

export const metadata = { title: "Kelola Pengurus" };

export default async function KelolaPengurusPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) redirect("/dashboard");

  const pengurus = await prisma.pengurus.findMany({ include: { user: true }, orderBy: { urutan: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Kelola Pengurus & Struktur Organisasi</h1>
      <PengurusManager initialData={JSON.parse(JSON.stringify(pengurus))} isAdmin={kap.isAdmin} />
    </div>
  );
}
