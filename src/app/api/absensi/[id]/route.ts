import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT: User mengupdate data absensi mereka sendiri
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { fotoUrl, status, keterangan } = await req.json();

  const absensi = await prisma.absensiAnggota.findUnique({
    where: { id: params.id },
  });

  if (!absensi) {
    return NextResponse.json(
      { message: "Absensi tidak ditemukan" },
      { status: 404 }
    );
  }

  // User hanya bisa update data absensi mereka sendiri
  if (absensi.userId !== userId) {
    return NextResponse.json(
      { message: "Anda hanya dapat mengupdate absensi Anda sendiri" },
      { status: 403 }
    );
  }

  const updated = await prisma.absensiAnggota.update({
    where: { id: params.id },
    data: {
      ...(fotoUrl !== undefined && { fotoUrl }),
      ...(status !== undefined && { status }),
      ...(keterangan !== undefined && { keterangan }),
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
      agenda: { select: { id: true, judul: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE: User menghapus absensi mereka sendiri
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const absensi = await prisma.absensiAnggota.findUnique({
    where: { id: params.id },
  });

  if (!absensi) {
    return NextResponse.json(
      { message: "Absensi tidak ditemukan" },
      { status: 404 }
    );
  }

  // User hanya bisa hapus data absensi mereka sendiri
  if (absensi.userId !== userId) {
    return NextResponse.json(
      { message: "Anda hanya dapat menghapus absensi Anda sendiri" },
      { status: 403 }
    );
  }

  await prisma.absensiAnggota.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Absensi berhasil dihapus" });
}
