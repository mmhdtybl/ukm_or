import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { sendMail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function GET() {
  const kap = await getKapabilitas();
  if (!kap || (!kap.canManageAnggota && !kap.canManageDivisiStaff)) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  const where = kap.divisiScope && !kap.canManageAnggota ? { divisi: kap.divisiScope } : {};
  const list = await prisma.anggota.findMany({ where, include: { user: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();

  const bolehBuat = kap.canManageAnggota || (kap.canManageDivisiStaff && kap.divisiScope === body.divisi);
  if (!bolehBuat) {
    return NextResponse.json({ message: "Anda hanya dapat menambahkan anggota pada divisi Anda sendiri." }, { status: 403 });
  }

  const existing = await prisma.anggota.findUnique({ where: { nim: body.nim } });
  if (existing) return NextResponse.json({ message: "NIM ini sudah terdaftar sebagai anggota." }, { status: 400 });

  if (body.email) {
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ nim: body.nim }, { email: body.email }] } });
    if (existingUser) return NextResponse.json({ message: "NIM atau email ini sudah dipakai akun lain." }, { status: 400 });
  }

  const password = body.email ? Math.random().toString(36).slice(2, 10) : null;
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const item = await prisma.$transaction(async (tx) => {
    const user = body.email
      ? await tx.user.create({ data: { name: body.nama, nim: body.nim, email: body.email, password: passwordHash!, role: "ANGGOTA" } })
      : null;
    return tx.anggota.create({
      data: {
        userId: user?.id,
        nim: body.nim,
        nama: body.nama,
        prodi: body.prodi,
        angkatan: body.angkatan,
        noHp: body.noHp || null,
        alamat: body.alamat || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        divisi: body.divisi || null,
        status: body.status || "Aktif",
        periode: body.periode || null,
      },
    });
  });

  if (body.email && password) {
    await sendMail(body.email, "Akun Login UKM Olahraga Unimma", `<p>Halo, ${body.nama}!</p><p>Akun login Anda telah dibuat.</p><p><b>NPM/NIM:</b> ${body.nim}<br/><b>Password:</b> ${password}</p>`);
  }
  return NextResponse.json({ ...item, password }, { status: 201 });
}
