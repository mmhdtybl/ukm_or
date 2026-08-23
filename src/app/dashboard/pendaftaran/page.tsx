import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { redirect } from "next/navigation";
import PendaftaranManager from "@/components/admin/PendaftaranManager";

export const metadata = { title: "Pendaftaran Anggota" };

export default async function KelolaPendaftaranPage() {
  const kap = await getKapabilitas();
  if (!kap?.canManageAnggota) redirect("/dashboard");

  const [pendaftaran, linkWhatsApp, pendaftaranGoogle] = await Promise.all([
    prisma.pendaftaran.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.linkWhatsApp.findMany(),
    prisma.pendaftaranGoogle.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-1">Pendaftaran Anggota Masuk</h1>
      <p className="text-slate-500 mb-6">
        Tinjau, terima, atau tolak pendaftaran anggota baru. Jika diterima, pendaftar dikirimi link grup WhatsApp — akun login dibuatkan belakangan secara manual di menu <b>Kelola Anggota</b> setelah bergabung.
      </p>
      <PendaftaranManager
        initialData={JSON.parse(JSON.stringify(pendaftaran))}
        initialLinks={JSON.parse(JSON.stringify(linkWhatsApp))}
        initialGoogleRequests={JSON.parse(JSON.stringify(pendaftaranGoogle))}
      />
    </div>
  );
}
