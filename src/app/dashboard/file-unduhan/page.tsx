import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import FileUnduhanManager from "@/components/admin/FileUnduhanManager";

export const metadata = { title: "Kelola File Unduhan" };

export default async function KelolaFileUnduhanPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageFileUnduhan) redirect("/dashboard");

  const files = await prisma.fileUnduhan.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Kelola File Unduhan (AD/ART, Proposal, dll)</h1>
      <FileUnduhanManager initialData={JSON.parse(JSON.stringify(files))} />
    </div>
  );
}
