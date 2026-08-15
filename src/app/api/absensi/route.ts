import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Daftar absensi untuk satu kegiatan (bisa dilihat semua user)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const agendaId = req.nextUrl.searchParams.get("agendaId");
  if (!agendaId) return NextResponse.json({ message: "agendaId wajib diisi" }, { status: 400 });

  const list = await prisma.absensiAnggota.findMany({
    where: { agendaId },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, name: true, role: true } },
      status: true,
      fotoUrl: true,
      keterangan: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

// POST: User menandai kehadiran mereka sendiri
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const { agendaId, fotoUrl, status, keterangan } = await req.json();
  if (!agendaId) return NextResponse.json({ message: "agendaId wajib diisi" }, { status: 400 });

  const userId = (session.user as any).id;

  // Cek apakah agenda ada
  const agenda = await prisma.agenda.findUnique({
    where: { id: agendaId },
  });
  if (!agenda) {
    return NextResponse.json({ message: "Kegiatan tidak ditemukan" }, { status: 404 });
  }

  // Cek apakah user sudah absen
  const sudahAbsen = await prisma.absensiAnggota.findUnique({
    where: {
      agendaId_userId: { agendaId, userId },
    },
  });

  if (sudahAbsen) {
    return NextResponse.json(
      { message: "Anda sudah absen untuk kegiatan ini" },
      { status: 409 }
    );
  }

  // Buat record absensi
  const absensi = await prisma.absensiAnggota.create({
    data: {
      agendaId,
      userId,
      fotoUrl: fotoUrl || null,
      status: status || "HADIR",
      keterangan: keterangan || null,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
      agenda: { select: { id: true, judul: true } },
    },
  });

  return NextResponse.json(absensi, { status: 201 });
}
