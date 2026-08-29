import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

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

  const duplicate = await prisma.user.findFirst({ where: { nim: body.nim } });
  if (duplicate) return NextResponse.json({ message: "NIM ini sudah dipakai akun lain." }, { status: 400 });

  const item = await prisma.anggota.create({
    data: {
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

  return NextResponse.json(item, { status: 201 });
}
