import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });

  const userId = (session.user as any).id;

  const [list, unread] = await Promise.all([
    prisma.notifikasi.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notifikasi.count({ where: { userId, dibaca: false } }),
  ]);

  return NextResponse.json({ list, unread });
}

export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });

  const userId = (session.user as any).id;
  await prisma.notifikasi.updateMany({ where: { userId, dibaca: false }, data: { dibaca: true } });
  return NextResponse.json({ ok: true });
}