import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function GET() {
  const list = await prisma.barang.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBarang) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const item = await prisma.barang.create({
    data: {
      nama: body.nama,
      divisi: body.divisi || null,
      jumlah: Number(body.jumlah || 1),
      kondisi: body.kondisi || "Baik",
      gambar: body.gambar || null,
      keterangan: body.keterangan || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
