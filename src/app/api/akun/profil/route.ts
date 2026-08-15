import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });

  const { name, email, avatar } = await req.json();
  const nama = typeof name === "string" ? name.trim() : "";
  const surel = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!nama || !surel) {
    return NextResponse.json({ message: "Nama dan email wajib diisi" }, { status: 400 });
  }

  const emailDipakai = await prisma.user.findFirst({
    where: { email: surel, NOT: { id: userId } },
    select: { id: true },
  });
  if (emailDipakai) {
    return NextResponse.json({ message: "Email sudah digunakan oleh akun lain" }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: nama, email: surel, avatar: typeof avatar === "string" && avatar ? avatar : null },
    select: { id: true, name: true, email: true, avatar: true },
  });

  return NextResponse.json(user);
}
