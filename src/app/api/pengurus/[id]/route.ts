import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  try {
    const body = await req.json();

    if (!body.nama || !String(body.nama).trim()) {
      return NextResponse.json({ message: "Nama wajib diisi." }, { status: 400 });
    }
    if (!body.jabatan || !String(body.jabatan).trim()) {
      return NextResponse.json({ message: "Jabatan wajib diisi." }, { status: 400 });
    }
    if (!body.periodeMulai || !String(body.periodeMulai).trim()) {
      return NextResponse.json({ message: "Periode mulai wajib diisi." }, { status: 400 });
    }
    if ((body.kodeJabatan === "KADIV" || body.kodeJabatan === "STAFF_DIVISI") && !body.divisi) {
      return NextResponse.json({ message: "Cabang olahraga wajib dipilih untuk Kadiv atau Staff Divisi." }, { status: 400 });
    }

    const existing = await prisma.pengurus.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ message: "Data pengurus tidak ditemukan." }, { status: 404 });

    const item = await prisma.pengurus.update({
      where: { id: params.id },
      data: {
        nama: String(body.nama).trim(),
        nim: body.nim ? String(body.nim).trim() : null,
        prodi: body.prodi ? String(body.prodi).trim() : null,
        noHp: body.noHp ? String(body.noHp).trim() : null,
        alamat: body.alamat ? String(body.alamat).trim() : null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jabatan: String(body.jabatan).trim(),
        kodeJabatan: body.kodeJabatan || "KADIV",
        kelompok: body.kelompok || "Lainnya",
        divisi: body.divisi || null,
        foto: body.foto || null,
        periodeMulai: String(body.periodeMulai).trim(),
        periodeAkhir: body.periodeAkhir ? String(body.periodeAkhir).trim() : null,
        urutan: Number(body.urutan || 0),
        isActive: body.isActive ?? true,
        status: body.status || "Aktif",
      },
    });
    return NextResponse.json(item);
  } catch (error: any) {
    console.error("PUT /api/pengurus/[id] error:", error);
    return NextResponse.json({ message: error?.message || "Gagal memperbarui data pengurus." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.isAdmin) return NextResponse.json({ message: "Hanya admin yang dapat mengubah kredensial akun." }, { status: 403 });

  try {
    const pengurus = await prisma.pengurus.findUnique({ where: { id: params.id }, include: { user: true } });
    if (!pengurus?.user) return NextResponse.json({ message: "Akun pengurus belum tersedia." }, { status: 404 });

    const { password } = await req.json();
    if (!password || password.length < 6) return NextResponse.json({ message: "Password minimal 6 karakter." }, { status: 400 });

    await prisma.user.update({
      where: { id: pengurus.user.id },
      data: { password: await bcrypt.hash(password, 10) },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("PATCH /api/pengurus/[id] error:", error);
    return NextResponse.json({ message: error?.message || "Gagal memperbarui kredensial." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManagePengurus) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  try {
    await prisma.pengurus.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("DELETE /api/pengurus/[id] error:", error);
    return NextResponse.json({ message: error?.message || "Gagal menghapus pengurus." }, { status: 500 });
  }
}
