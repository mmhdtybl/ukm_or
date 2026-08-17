import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  if ((body.kodeJabatan === "KADIV" || body.kodeJabatan === "STAFF_DIVISI") && !body.divisi) {
    return NextResponse.json({ message: "Cabang olahraga wajib dipilih untuk Kadiv atau Staff Divisi." }, { status: 400 });
  }
  const item = await prisma.pengurus.update({
    where: { id: params.id },
    data: {
      nama: body.nama,
      jabatan: body.jabatan,
      kodeJabatan: body.kodeJabatan || "KADIV",
      kelompok: body.kelompok || "Lainnya",
      divisi: body.divisi || null,
      foto: body.foto || null,
      periodeMulai: body.periodeMulai,
      periodeAkhir: body.periodeAkhir || null,
      urutan: Number(body.urutan || 0),
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(item);
}

// Pengurus juga dapat diberi akun atau kredensialnya dikelola dari data jabatannya.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.isAdmin) return NextResponse.json({ message: "Hanya admin yang dapat mengubah kredensial akun." }, { status: 403 });
  const pengurus = await prisma.pengurus.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!pengurus?.user) return NextResponse.json({ message: "Akun pengurus belum tersedia." }, { status: 404 });
  const { email, password } = await req.json();
  if (!email) return NextResponse.json({ message: "Email wajib diisi." }, { status: 400 });
  if (password && password.length < 6) return NextResponse.json({ message: "Password minimal 6 karakter." }, { status: 400 });
  const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id: pengurus.user.id } } });
  if (duplicate) return NextResponse.json({ message: "Email ini sudah dipakai akun lain." }, { status: 400 });
  await prisma.user.update({ where: { id: pengurus.user.id }, data: { email, ...(password ? { password: await bcrypt.hash(password, 10) } : {}) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.pengurus.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
