import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageArsip) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  await prisma.arsip.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
