import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
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

  // Password otomatis dari tanggal lahir (ddmmyyyy)
  let password: string | null = null;
  if (body.tanggalLahir) {
    const tgl = new Date(body.tanggalLahir);
    const dd = String(tgl.getDate()).padStart(2, "0");
    const mm = String(tgl.getMonth() + 1).padStart(2, "0");
    const yyyy = String(tgl.getFullYear());
    password = `${dd}${mm}${yyyy}`;
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const item = await prisma.$transaction(async (tx) => {
    const user = body.nim
      ? await tx.user.create({
          data: {
            name: body.nama,
            nim: body.nim,
            password: passwordHash!,
            role: "PENGURUS",
          },
        })
      : null;

    return tx.pengurus.create({
      data: {
        userId: user?.id,
        nama: body.nama,
        nim: body.nim || null,
        prodi: body.prodi || null,
        noHp: body.noHp || null,
        alamat: body.alamat || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jabatan: body.jabatan,
        kodeJabatan: body.kodeJabatan || "KADIV",
        kelompok: body.kelompok || "Lainnya",
        divisi: body.divisi || null,
        foto: body.foto || null,
        periodeMulai: body.periodeMulai,
        periodeAkhir: body.periodeAkhir || null,
        urutan: Number(body.urutan || 0),
        isActive: body.isActive ?? true,
        status: body.status || "Aktif",
      },
    });
  });

  return NextResponse.json({ ...item, password }, { status: 201 });
}
