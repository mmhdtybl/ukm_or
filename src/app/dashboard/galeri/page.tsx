import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import GaleriManager from "@/components/admin/GaleriManager";

export const metadata = { title: "Kelola Galeri" };

export default async function KelolaGaleriPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageGaleriStruktur) redirect("/dashboard");

  const galeri = await prisma.galeri.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Kelola Galeri</h1>
      <GaleriManager initialData={galeri} />
    </div>
  );
}
