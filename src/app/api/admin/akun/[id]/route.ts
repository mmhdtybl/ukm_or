import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import bcrypt from "bcryptjs";

async function adminOnly() {
  const kap = await getKapabilitas();
  return Boolean(kap?.isAdmin);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await adminOnly()) return NextResponse.json({ message: "Hanya admin yang dapat mengubah akun." }, { status: 403 });
  const { email, password } = await req.json();
  if (!email) return NextResponse.json({ message: "Email wajib diisi." }, { status: 400 });
  if (password && password.length < 6) return NextResponse.json({ message: "Password minimal 6 karakter." }, { status: 400 });
  const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id: params.id } } });
  if (duplicate) return NextResponse.json({ message: "Email telah dipakai akun lain." }, { status: 400 });
  await prisma.user.update({ where: { id: params.id }, data: { email, ...(password ? { password: await bcrypt.hash(password, 10) } : {}) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await adminOnly()) return NextResponse.json({ message: "Hanya admin yang dapat menghapus akun." }, { status: 403 });
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ message: "Akun tidak ditemukan." }, { status: 404 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Akun administrator tidak dapat dihapus dari menu ini." }, { status: 400 });
  await prisma.$transaction([
    prisma.anggota.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.pengurus.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  return NextResponse.json({ ok: true });
}
