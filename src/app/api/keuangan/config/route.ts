import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";
import { getKasConfig } from "@/lib/kas-config";

// GET: mengembalikan tujuan transfer kas (dibaca siapa pun yang punya menu kas).
export async function GET() {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const config = await getKasConfig();
  return NextResponse.json(config);
}

// PUT: Bendahara/Ketua/Wakil/Admin memperbarui tujuan transfer kas.
export async function PUT(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap || !kap.canManageKeuangan) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  const body = await req.json();
  const tujuan = typeof body.tujuan === "string" ? body.tujuan.trim() : null;

  const existing = await prisma.kasKonfigurasi.findFirst();
  const config = existing
    ? await prisma.kasKonfigurasi.update({
        where: { id: existing.id },
        data: { tujuan: tujuan || null, updatedBy: (session.user as any).id },
      })
    : await prisma.kasKonfigurasi.create({
        data: {
          tujuan: tujuan || null,
          createdBy: (session.user as any).id,
          updatedBy: (session.user as any).id,
        },
      });

  return NextResponse.json(config);
}
