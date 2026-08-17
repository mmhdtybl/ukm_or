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
    select: { name: true, email: true, nim: true, avatar: true, role: true },
  });
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary dark:text-white">Profil Saya</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">Perbarui informasi akun dan foto profil Anda.</p>
      <ProfilSayaForm
        initialData={{ name: user.name, email: user.email, nim: user.nim, avatar: user.avatar }}
        isAdmin={user.role === "ADMIN"}
      />
    </div>
  );
}
