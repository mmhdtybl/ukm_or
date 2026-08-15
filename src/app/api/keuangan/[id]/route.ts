import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

// PATCH: verifikasi/tolak laporan kas dari anggota (khusus Bendahara/Ketua/Wakil/Admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageKeuangan) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const { status } = await req.json(); // DIVERIFIKASI / DITOLAK
  const item = await prisma.keuangan.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageKeuangan) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.keuangan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
