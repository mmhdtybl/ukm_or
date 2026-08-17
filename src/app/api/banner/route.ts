import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function GET() {
  const list = await prisma.banner.findMany({ orderBy: { urutan: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.canManageProfilWeb) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  const body = await req.json();
  if (!body.gambar) return NextResponse.json({ message: "Gambar banner wajib diisi." }, { status: 400 });
  const item = await prisma.banner.create({ data: { judul: "Banner Home", gambar: body.gambar, linkUrl: body.linkUrl || null, urutan: Number(body.urutan || 0) } });
  return NextResponse.json(item, { status: 201 });
}
