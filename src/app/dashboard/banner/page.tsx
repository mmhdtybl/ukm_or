import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import BannerManager from "@/components/admin/BannerManager";

export const metadata = { title: "Kelola Banner" };

export default async function KelolaBannerPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageProfilWeb) redirect("/dashboard");

  const banner = await prisma.banner.findMany({ orderBy: { urutan: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Kelola Banner Home</h1>
      <BannerManager initialData={JSON.parse(JSON.stringify(banner))} />
    </div>
  );
}
