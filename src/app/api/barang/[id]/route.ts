import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBarang) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const item = await prisma.barang.update({
    where: { id: params.id },
    data: {
      nama: body.nama,
      divisi: body.divisi || null,
      jumlah: Number(body.jumlah || 1),
      kondisi: body.kondisi,
      gambar: body.gambar || null,
      keterangan: body.keterangan || null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBarang) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  await prisma.barang.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
