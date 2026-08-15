import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

export async function GET() {
  const list = await prisma.prestasi.findMany({ orderBy: { tahun: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  const boleh = kap && (kap.isAdmin || kap.isKetuaOrWakil || kap.canManageGaleriStruktur);
  if (!boleh) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  const body = await req.json();
  const item = await prisma.prestasi.create({
    data: { ...body, tahun: Number(body.tahun) },
  });
  return NextResponse.json(item, { status: 201 });
}
