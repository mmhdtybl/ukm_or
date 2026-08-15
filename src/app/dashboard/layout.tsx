import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getKapabilitas } from "@/lib/permissions";
import DashboardShell from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !["ADMIN", "PENGURUS"].includes((session.user as any).role)) {
    redirect("/login");
  }

  const kap = await getKapabilitas();
  if (!kap) redirect("/login");

  return (
    <DashboardShell kap={kap} name={session.user.name || ""} avatar={(await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { avatar: true } }))?.avatar || null}>
      {children}
    </DashboardShell>
  );
}
