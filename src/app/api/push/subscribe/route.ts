import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST: daftarkan subscription push untuk user yang login
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json().catch(() => null);
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ message: "Data subscription tidak lengkap" }, { status: 400 });
  }

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: body.endpoint },
  });

  if (existing) {
    await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: { p256dh: body.keys.p256dh, auth: body.keys.auth, userId },
    });
    return NextResponse.json({ ok: true, updated: true });
  }

  await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE: hapus subscription (saat user mematikan notifikasi / log out)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });

  const endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ message: "endpoint wajib diisi" }, { status: 400 });

  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}