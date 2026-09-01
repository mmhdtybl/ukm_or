import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfilSayaForm from "@/components/ProfilSayaForm";

export const metadata = { title: "Profil Saya" };

export default async function ProfilSayaPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { anggota: true, pengurus: true },
  });
  if (!user) notFound();

  const anggota = user.anggota;
  const pengurus = user.pengurus;

  const tipeProfil = user.role === "ADMIN" ? "ADMIN" : pengurus ? "PENGURUS" : anggota ? "ANGGOTA" : "ADMIN";

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white">Profil Saya</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">Perbarui informasi akun dan foto profil Anda.</p>
      <ProfilSayaForm
        tipeProfil={tipeProfil}
        isAdmin={user.role === "ADMIN"}
        initialData={{
          name: user.name,
          nim: user.nim,
          avatar: user.avatar,
          prodi: anggota?.prodi || pengurus?.prodi || "",
          divisi: anggota?.divisi || pengurus?.divisi || "",
          jabatan: pengurus?.jabatan || "",
          noHp: anggota?.noHp || pengurus?.noHp || "",
          tanggalLahir: (anggota?.tanggalLahir || pengurus?.tanggalLahir)?.toISOString().slice(0, 10) || "",
          periode: anggota?.periode || pengurus?.periodeMulai || "",
        }}
      />
    </div>
  );
}
