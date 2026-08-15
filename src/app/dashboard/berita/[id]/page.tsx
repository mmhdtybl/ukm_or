import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import BeritaForm from "@/components/admin/BeritaForm";

export const metadata = { title: "Edit Berita" };

export default async function EditBeritaPage({ params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBerita) redirect("/dashboard");

  const [berita, kategoriList] = await Promise.all([
    prisma.berita.findUnique({ where: { id: params.id } }),
    prisma.kategoriBerita.findMany(),
  ]);
  if (!berita) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Edit Berita</h1>
      <BeritaForm kategoriList={kategoriList} initialData={berita} />
    </div>
  );
}
