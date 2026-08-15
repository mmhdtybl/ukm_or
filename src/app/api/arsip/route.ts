import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";

export async function GET() {
  const list = await prisma.arsip.findMany({
    include: { diunggahOleh: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap?.canManageArsip) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const item = await prisma.arsip.create({
    data: {
      judul: body.judul,
      kategori: body.kategori || null,
      fileUrl: body.fileUrl,
      diunggahOlehId: (session.user as any).id,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
