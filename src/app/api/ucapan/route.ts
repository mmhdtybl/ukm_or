import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";

// GET: daftar ucapan untuk satu orang yang berulang tahun.
// query: ?tipe=ANGGOTA|PENGURUS&id=<id>
export async function GET(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const tipe = req.nextUrl.searchParams.get("tipe");
  const id = req.nextUrl.searchParams.get("id");

  if (!tipe || !id) return NextResponse.json([], { status: 200 });

  const ucapan =
    tipe === "PENGURUS"
      ? await prisma.ucapan.findMany({ where: { pengurusId: id }, orderBy: { createdAt: "desc" } })
      : await prisma.ucapan.findMany({ where: { anggotaId: id }, orderBy: { createdAt: "desc" } });

  return NextResponse.json(ucapan);
}

// POST: kirim ucapan "selamat" untuk orang yang berulang tahun.
export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const pesan = typeof body.pesan === "string" ? body.pesan.trim() : "";
  const tipe = body.tipe === "PENGURUS" ? "PENGURUS" : body.tipe === "ANGGOTA" ? "ANGGOTA" : null;
  const id = typeof body.id === "string" ? body.id : null;

  if (!pesan || !tipe || !id) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }

  const data =
    tipe === "PENGURUS"
      ? { pengurusId: id }
      : { anggotaId: id };

  const item = await prisma.ucapan.create({
    data: {
      ...data,
      pengirim: (session.user as any).name || "Pengguna",
      pesan,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
