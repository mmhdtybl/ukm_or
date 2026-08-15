import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import KontakManager from "@/components/admin/KontakManager";

export const metadata = { title: "Pesan Kontak" };

export default async function KelolaKontakPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageKontak) redirect("/dashboard");

  const kontak = await prisma.kontak.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Pesan Masuk dari Halaman Kontak</h1>
      <KontakManager initialData={JSON.parse(JSON.stringify(kontak))} />
    </div>
  );
}
