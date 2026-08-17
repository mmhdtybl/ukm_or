import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });

  const { name, email, avatar, nim, password } = await req.json();
  const nama = typeof name === "string" ? name.trim() : "";
  const surel = typeof email === "string" ? email.trim().toLowerCase() : "";
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const npm = typeof nim === "string" ? nim.trim() : "";

  if (!nama || !surel) {
    return NextResponse.json({ message: "Nama dan email wajib diisi" }, { status: 400 });
  }
  if (isAdmin && !npm) return NextResponse.json({ message: "NPM/NIM wajib diisi" }, { status: 400 });
  if (!isAdmin && (nim !== undefined || password !== undefined)) {
    return NextResponse.json({ message: "Anda tidak diizinkan mengubah NPM/NIM atau password dari halaman profil." }, { status: 403 });
  }
  if (isAdmin && password && (typeof password !== "string" || password.length < 6)) {
    return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
  }

  const emailDipakai = await prisma.user.findFirst({
    where: { email: surel, NOT: { id: userId } },
    select: { id: true },
  });
  if (emailDipakai) {
    return NextResponse.json({ message: "Email sudah digunakan oleh akun lain" }, { status: 409 });
  }
  if (isAdmin) {
    const nimDipakai = await prisma.user.findFirst({ where: { nim: npm, NOT: { id: userId } }, select: { id: true } });
    if (nimDipakai) return NextResponse.json({ message: "NPM/NIM sudah digunakan oleh akun lain" }, { status: 409 });
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        name: nama,
        email: surel,
        avatar: typeof avatar === "string" && avatar ? avatar : null,
        ...(isAdmin ? { nim: npm } : {}),
        ...(isAdmin && password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
      select: { id: true, name: true, email: true, nim: true, avatar: true },
    });
    if (isAdmin) await tx.anggota.updateMany({ where: { userId }, data: { nim: npm } });
    return updated;
  });

  return NextResponse.json(user);
}
