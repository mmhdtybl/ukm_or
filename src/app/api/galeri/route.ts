import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function GET() {
  const list = await prisma.galeri.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.canManageGaleriStruktur) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  const body = await req.json();
  const item = await prisma.galeri.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}
