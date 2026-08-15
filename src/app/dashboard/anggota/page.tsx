import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { redirect } from "next/navigation";
import AnggotaManager from "@/components/admin/AnggotaManager";

export const metadata = { title: "Kelola Anggota" };

export default async function KelolaAnggotaPage() {
  const kap = await getKapabilitas();
  if (!kap || (!kap.canManageAnggota && !kap.canManageDivisiStaff && !kap.isDPO)) redirect("/dashboard");

  const where = kap.divisiScope && !kap.canManageAnggota ? { divisi: kap.divisiScope } : {};
  const anggota = await prisma.anggota.findMany({ where, include: { user: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">
        {kap.kodeJabatan === "KADIV" ? `Staff Divisi ${kap.divisiScope}` : "Kelola Anggota"}
      </h1>
      <p className="text-slate-500 mb-6">
        {kap.divisiScope && !kap.canManageAnggota
          ? "Anda hanya dapat mengelola staff pada divisi Anda sendiri."
          : "Kelola data anggota UKM Olahraga Unimma dan buat akun login untuk anggota yang sudah bergabung di grup WhatsApp."}
      </p>
      <AnggotaManager
        initialData={JSON.parse(JSON.stringify(anggota))}
        divisiLock={kap.divisiScope && !kap.canManageAnggota ? kap.divisiScope : null}
        readOnly={kap.viewOnly}
      />
    </div>
  );
}
