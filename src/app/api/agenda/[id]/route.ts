import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const agenda = await prisma.agenda.findUnique({ where: { id: params.id } });
  if (!agenda) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(agenda);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageEvent) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const agenda = await prisma.agenda.update({
    where: { id: params.id },
    data: {
      judul: body.judul,
      deskripsi: body.deskripsi,
      lokasi: body.lokasi,
      tanggalMulai: new Date(body.tanggalMulai),
      tanggalSelesai: new Date(body.tanggalSelesai),
      gambar: body.gambar || null,
      status: body.status,
      kuota: body.kuota ? Number(body.kuota) : null,
      penyelenggara: body.penyelenggara || null,
    },
  });
  return NextResponse.json(agenda);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageEvent) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.agenda.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
