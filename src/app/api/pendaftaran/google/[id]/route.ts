import { NextResponse } from "next/server";
import { getKapabilitas } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const kapabilitas = await getKapabilitas();
  if (!kapabilitas?.canManageAnggota) {
    return NextResponse.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  }

  try {
    const request = await prisma.pendaftaranGoogle.update({
      where: { id: params.id },
      data: { status: "SELESAI" },
    });
    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ message: "Permintaan Google tidak ditemukan." }, { status: 404 });
  }
}
