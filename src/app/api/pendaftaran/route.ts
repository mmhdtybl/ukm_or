import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nama: z.string().min(2),
  nim: z.string().min(3),
  email: z.string().email(),
  noHp: z.string().min(8),
  prodi: z.string().min(2),
  angkatan: z.string().min(2),
  motivasi: z.string().min(5),
  divisiPilihan: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Mohon lengkapi semua data dengan benar." }, { status: 400 });
  }

  const existing = await prisma.pendaftaran.findFirst({
    where: { nim: parsed.data.nim, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ message: "NIM ini sudah terdaftar dan sedang menunggu peninjauan." }, { status: 400 });
  }

  const pendaftaran = await prisma.pendaftaran.create({ data: parsed.data });
  return NextResponse.json(pendaftaran, { status: 201 });
}

export async function GET() {
  const list = await prisma.pendaftaran.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}
