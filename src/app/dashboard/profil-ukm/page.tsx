import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import ProfilUKMForm from "@/components/admin/ProfilUKMForm";

export const metadata = { title: "Ketentuan Website" };

export default async function KelolaProfilUKMPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageProfilWeb) redirect("/dashboard");

  const profil = await prisma.profilUKM.findFirst();
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Ketentuan & Profil Website</h1>
      <ProfilUKMForm initialData={profil ? JSON.parse(JSON.stringify(profil)) : null} />
    </div>
  );
}
