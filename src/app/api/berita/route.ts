import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";
import { makeSlug } from "@/lib/utils";

export async function GET() {
  const list = await prisma.berita.findMany({
    include: { kategori: true, penulis: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap?.canManageBerita) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const berita = await prisma.berita.create({
    data: {
      judul: body.judul,
      slug: makeSlug(body.judul),
      ringkasan: body.ringkasan,
      konten: body.konten,
      gambar: body.gambar || null,
      kategoriId: body.kategoriId || null,
      isPublished: !!body.isPublished,
      penulisId: (session.user as any).id,
    },
  });
  return NextResponse.json(berita, { status: 201 });
}
