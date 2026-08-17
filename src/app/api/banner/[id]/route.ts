import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageProfilWeb) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  const body = await req.json();
  if (!body.gambar) return NextResponse.json({ message: "Gambar banner wajib diisi." }, { status: 400 });
  const item = await prisma.banner.update({ where: { id: params.id }, data: { gambar: body.gambar, linkUrl: body.linkUrl || null, urutan: Number(body.urutan || 0) } });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageProfilWeb) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
