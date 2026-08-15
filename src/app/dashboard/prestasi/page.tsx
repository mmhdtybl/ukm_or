import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import PrestasiManager from "@/components/admin/PrestasiManager";

export const metadata = { title: "Kelola Prestasi" };

export default async function KelolaPrestasiPage() {
  const kap = await getKapabilitas();
  const boleh = kap && (kap.isAdmin || kap.isKetuaOrWakil || kap.canManageGaleriStruktur);
  if (!boleh) redirect("/dashboard");

  const prestasi = await prisma.prestasi.findMany({ orderBy: [{ tahun: "desc" }, { createdAt: "desc" }] });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Kelola Prestasi</h1>
      <PrestasiManager initialData={JSON.parse(JSON.stringify(prestasi))} />
    </div>
  );
}
