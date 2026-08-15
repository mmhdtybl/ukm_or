import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nama: z.string().min(2),
  email: z.string().email(),
  subjek: z.string().min(2),
  pesan: z.string().min(5),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }
  const kontak = await prisma.kontak.create({ data: parsed.data });
  return NextResponse.json(kontak, { status: 201 });
}

export async function GET() {
  const list = await prisma.kontak.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}
