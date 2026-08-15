import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import BeritaForm from "@/components/admin/BeritaForm";

export const metadata = { title: "Tambah Berita" };

export default async function TambahBeritaPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageBerita) redirect("/dashboard");

  const kategoriList = await prisma.kategoriBerita.findMany();
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Tambah Berita Baru</h1>
      <BeritaForm kategoriList={kategoriList} />
    </div>
  );
}
