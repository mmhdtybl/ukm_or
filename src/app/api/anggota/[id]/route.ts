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
  const item = await prisma.anggota.update({
    where: { id: params.id },
    data: {
      nama: body.nama,
      prodi: body.prodi,
      angkatan: body.angkatan,
      noHp: body.noHp,
      divisi: body.divisi,
      status: body.status,
      periode: body.periode,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const cek = await bolehKelola(params.id);
  if (!cek.ok) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.anggota.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
