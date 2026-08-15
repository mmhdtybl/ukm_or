import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import AgendaForm from "@/components/admin/AgendaForm";

export const metadata = { title: "Tambah Agenda" };

export default async function TambahAgendaPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageEvent) redirect("/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-6">Tambah Agenda Kegiatan</h1>
      <AgendaForm />
    </div>
  );
}
