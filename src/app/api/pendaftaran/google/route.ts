import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ nim: z.string().trim().min(3, "NPM/NIM wajib diisi.") });

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  const nama = session?.user?.name?.trim() || "Pendaftar Google";
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Hanya sesi Google baru tanpa akun lokal yang dapat membuat permintaan.
  if (!email || role) return NextResponse.json({ message: "Sesi Google tidak valid. Silakan coba daftar kembali." }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Data tidak valid." }, { status: 400 });

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { nim: parsed.data.nim }] } });
  if (existingUser) return NextResponse.json({ message: "Email atau NPM/NIM tersebut sudah terdaftar sebagai akun." }, { status: 409 });

  const request = await prisma.pendaftaranGoogle.upsert({
    where: { email },
    create: { nama, email, nim: parsed.data.nim, status: "PENDING" },
    update: { nama, nim: parsed.data.nim, status: "PENDING" },
  });
  return NextResponse.json({ success: true, data: request }, { status: 201 });
}
