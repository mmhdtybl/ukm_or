import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const item = await prisma.pengurus.update({
    where: { id: params.id },
    data: {
      nama: body.nama,
      jabatan: body.jabatan,
      kodeJabatan: body.kodeJabatan || "KADIV",
      kelompok: body.kelompok || "Lainnya",
      divisi: body.divisi || null,
      foto: body.foto || null,
      periodeMulai: body.periodeMulai,
      periodeAkhir: body.periodeAkhir || null,
      urutan: Number(body.urutan || 0),
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.pengurus.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
