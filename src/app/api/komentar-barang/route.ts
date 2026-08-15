import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";

// GET: Bidang Inventaris/Ketua/Wakil/Admin melihat semua komentar/laporan.
// Anggota biasa hanya melihat komentar miliknya sendiri.
export async function GET() {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  if (kap.canManageBarang) {
    const list = await prisma.komentarBarang.findMany({
      include: { anggota: { select: { nama: true, nim: true } }, barang: { select: { nama: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  }

  const anggota = await prisma.anggota.findUnique({ where: { userId: (session.user as any).id } });
  if (!anggota) return NextResponse.json([], { status: 200 });

  const list = await prisma.komentarBarang.findMany({
    where: { anggotaId: anggota.id },
    include: { barang: { select: { nama: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

// POST: anggota/staff mengajukan request barang baru atau melaporkan barang rusak
export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap?.canKomentarBarang) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const anggota = await prisma.anggota.findUnique({ where: { userId: (session.user as any).id } });
  if (!anggota) return NextResponse.json({ message: "Akun ini bukan akun anggota" }, { status: 400 });

  const { barangId, jenis, pesan } = await req.json();
  const item = await prisma.komentarBarang.create({
    data: { barangId: barangId || null, anggotaId: anggota.id, jenis, pesan },
  });
  return NextResponse.json(item, { status: 201 });
}
