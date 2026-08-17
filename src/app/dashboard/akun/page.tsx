import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { redirect } from "next/navigation";
import AkunManager from "@/components/admin/AkunManager";

export const metadata = { title: "Kelola Akun & Password" };

export default async function KelolaAkunPage() {
  const kap = await getKapabilitas();
  if (!kap?.isAdmin) redirect("/dashboard");

  const [anggota, pengurus] = await Promise.all([
    prisma.anggota.findMany({ include: { user: true }, orderBy: { nama: "asc" } }),
    prisma.pengurus.findMany({ include: { user: true }, orderBy: { nama: "asc" } }),
  ]);
  return <AkunManager anggota={JSON.parse(JSON.stringify(anggota))} pengurus={JSON.parse(JSON.stringify(pengurus))} />;
}
