import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

// PATCH: tandai komentar/laporan sudah ditindaklanjuti (khusus Bidang Inventaris/Ketua/Wakil/Admin)
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBarang) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const item = await prisma.komentarBarang.update({ where: { id: params.id }, data: { status: "DITINDAK" } });
  return NextResponse.json(item);
}
