import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

async function bolehKelola(id: string) {
  const kap = await getKapabilitas();
  if (!kap) return { ok: false as const };
  if (kap.canManageAnggota) return { ok: true as const, kap };

  if (kap.canManageDivisiStaff && kap.divisiScope) {
    const target = await prisma.anggota.findUnique({ where: { id } });
    if (target?.divisi === kap.divisiScope) return { ok: true as const, kap };
  }
  return { ok: false as const };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const cek = await bolehKelola(params.id);
  if (!cek.ok) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const existing = await prisma.anggota.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: "Data anggota tidak ditemukan." }, { status: 404 });
  const nim = String(body.nim || "").trim();
  if (!nim) return NextResponse.json({ message: "NIM wajib diisi." }, { status: 400 });
  if (nim !== existing.nim) {
    const [anggotaDuplikat, akunDuplikat] = await Promise.all([
      prisma.anggota.findFirst({ where: { nim, NOT: { id: params.id } } }),
      prisma.user.findFirst({ where: { nim, NOT: { id: existing.userId || "" } } }),
    ]);
    if (anggotaDuplikat || akunDuplikat) return NextResponse.json({ message: "NIM sudah digunakan anggota atau akun lain." }, { status: 400 });
  }
  const item = await prisma.$transaction(async (tx) => {
    if (existing.userId && nim !== existing.nim) await tx.user.update({ where: { id: existing.userId }, data: { nim } });
    return tx.anggota.update({
      where: { id: params.id },
      data: { nama: body.nama, nim, prodi: body.prodi, angkatan: body.angkatan, noHp: body.noHp || null, alamat: body.alamat || null, tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null, divisi: body.divisi, status: body.status, periode: body.periode },
    });
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const cek = await bolehKelola(params.id);
  if (!cek.ok) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.anggota.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
