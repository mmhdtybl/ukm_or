import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function GET() {
  const profil = await prisma.profilUKM.findFirst();
  return NextResponse.json(profil);
}

export async function PUT(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.canManageProfilWeb) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  const body = await req.json();

  const existing = await prisma.profilUKM.findFirst();
  const profil = existing
    ? await prisma.profilUKM.update({ where: { id: existing.id }, data: body })
    : await prisma.profilUKM.create({ data: body });

  return NextResponse.json(profil);
}
