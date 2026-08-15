import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import AgendaForm from "@/components/admin/AgendaForm";

export const metadata = { title: "Edit Agenda" };

export default async function EditAgendaPage({ params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageEvent) redirect("/dashboard");

  const agenda = await prisma.agenda.findUnique({ where: { id: params.id } });
  if (!agenda) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Edit Agenda Kegiatan</h1>
      <AgendaForm initialData={agenda} />
    </div>
  );
}
