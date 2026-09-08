import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });

  const userId = (session.user as any).id;
  await prisma.notifikasi.updateMany({
    where: { id: params.id, userId },
    data: { dibaca: true },
  });
  return NextResponse.json({ ok: true });
}