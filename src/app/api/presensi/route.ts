import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";

// GET: daftar dokumentasi presensi (foto kegiatan) untuk satu agenda
export async function GET(req: NextRequest) {
  const agendaId = req.nextUrl.searchParams.get("agendaId");
  if (!agendaId) return NextResponse.json({ message: "agendaId wajib diisi" }, { status: 400 });

  const list = await prisma.presensiFoto.findMany({
    where: { agendaId },
    select: {
      id: true, fotoUrl: true, keterangan: true, createdAt: true, diunggahOlehId: true,
      diunggahOleh: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

// POST: unggah foto dokumentasi kegiatan yang sedang berlangsung (presensi manual, bukan per-individu)
export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap?.canUploadPresensi) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  const { agendaId, fotoUrl, keterangan } = await req.json();
  if (!agendaId || !fotoUrl) return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });

  const sudahPresensi = await prisma.presensiFoto.count({ where: { agendaId } });
  if (sudahPresensi > 0) {
    return NextResponse.json({ message: "Presensi untuk kegiatan ini sudah disimpan" }, { status: 409 });
  }

  const item = await prisma.presensiFoto.create({
    data: { agendaId, fotoUrl, keterangan: keterangan || null, diunggahOlehId: (session.user as any).id },
  });
  return NextResponse.json(item, { status: 201 });
}
