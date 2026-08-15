import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageKontak) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  const item = await prisma.kontak.update({ where: { id: params.id }, data: { isRead: true } });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageKontak) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  await prisma.kontak.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
