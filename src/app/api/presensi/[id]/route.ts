import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const kap = await getKapabilitas();

  if (!session || !kap?.canUploadPresensi) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  const foto = await prisma.presensiFoto.findUnique({
    where: { id: params.id },
    select: { diunggahOlehId: true },
  });

  if (!foto) {
    return NextResponse.json({ message: "Foto presensi tidak ditemukan" }, { status: 404 });
  }

  const userId = (session.user as { id?: string }).id;
  const canDeleteAny = kap.isAdmin || kap.isKetuaOrWakil;
  if (!canDeleteAny && foto.diunggahOlehId !== userId) {
    return NextResponse.json({ message: "Anda hanya dapat menghapus foto sendiri" }, { status: 403 });
  }

  await prisma.presensiFoto.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Foto presensi berhasil dihapus" });
}
