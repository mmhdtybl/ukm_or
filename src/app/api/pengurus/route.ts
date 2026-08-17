import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { sendMail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function GET() {
  const list = await prisma.pengurus.findMany({ orderBy: { urutan: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  if ((body.kodeJabatan === "KADIV" || body.kodeJabatan === "STAFF_DIVISI") && !body.divisi) {
    return NextResponse.json({ message: "Cabang olahraga wajib dipilih untuk Kadiv atau Staff Divisi." }, { status: 400 });
  }
  if (body.email && !body.nim) return NextResponse.json({ message: "NPM/NIM wajib diisi untuk membuat akun pengurus." }, { status: 400 });
  if (body.email) {
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ nim: body.nim }, { email: body.email }] } });
    if (existingUser) return NextResponse.json({ message: "NPM/NIM atau email ini sudah dipakai akun lain." }, { status: 400 });
  }
  const password = body.email ? Math.random().toString(36).slice(2, 10) : null;
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const item = await prisma.$transaction(async (tx) => {
    const user = body.email
      ? await tx.user.create({ data: { name: body.nama, nim: body.nim, email: body.email, password: passwordHash!, role: "PENGURUS" } })
      : null;
    return tx.pengurus.create({
      data: {
        userId: user?.id,
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
  });
  if (body.email && password) {
    await sendMail(body.email, "Akun Login UKM Olahraga Unimma", `<p>Halo, ${body.nama}!</p><p>Akun pengurus Anda telah dibuat.</p><p><b>NPM/NIM:</b> ${body.nim}<br/><b>Password:</b> ${password}</p>`);
  }
  return NextResponse.json({ ...item, password }, { status: 201 });
}
