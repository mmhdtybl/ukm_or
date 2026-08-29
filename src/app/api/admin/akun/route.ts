import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.isAdmin) return NextResponse.json({ message: "Hanya admin yang dapat membuat akun." }, { status: 403 });
  const { tipe, targetId, nim: nimInput, password } = await req.json();
  if (!password) return NextResponse.json({ message: "Password wajib diisi." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ message: "Password minimal 6 karakter." }, { status: 400 });
  if (tipe !== "ANGGOTA" && tipe !== "PENGURUS") return NextResponse.json({ message: "Tipe akun tidak valid." }, { status: 400 });

  const anggota = tipe === "ANGGOTA" ? await prisma.anggota.findUnique({ where: { id: targetId } }) : null;
  const pengurus = tipe === "PENGURUS" ? await prisma.pengurus.findUnique({ where: { id: targetId } }) : null;
  const target = anggota || pengurus;
  if (!target) return NextResponse.json({ message: "Data tujuan tidak ditemukan." }, { status: 404 });
  if (target.userId) return NextResponse.json({ message: "Orang ini sudah memiliki akun." }, { status: 400 });
  const nim = anggota?.nim || nimInput;
  if (!nim) return NextResponse.json({ message: "NIM wajib diisi untuk akun pengurus." }, { status: 400 });
  const duplicate = await prisma.user.findFirst({ where: { nim } });
  if (duplicate) return NextResponse.json({ message: "NIM telah digunakan akun lain." }, { status: 400 });
  const user = await prisma.user.create({ data: { name: target.nama, nim, password: await bcrypt.hash(password, 10), role: tipe } });
  if (tipe === "ANGGOTA") await prisma.anggota.update({ where: { id: target.id }, data: { userId: user.id } });
  else await prisma.pengurus.update({ where: { id: target.id }, data: { userId: user.id } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
