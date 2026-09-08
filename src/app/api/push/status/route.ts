import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: status subscription push user (dipakai UI tombol notifikasi)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });

  const userId = (session.user as any).id;
  const count = await prisma.pushSubscription.count({ where: { userId } });

  return NextResponse.json({ subscribed: count > 0 });
}