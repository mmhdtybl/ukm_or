import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { kirimNotifikasiBroadcast } from "@/lib/notifikasi";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const berita = await prisma.berita.findUnique({ where: { id: params.id } });
  if (!berita) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(berita);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBerita) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const existing = await prisma.berita.findUnique({ where: { id: params.id }, select: { isPublished: true, slug: true } });
  const berita = await prisma.berita.update({
    where: { id: params.id },
    data: {
      judul: body.judul,
      ringkasan: body.ringkasan,
      konten: body.konten,
      gambar: body.gambar || null,
      kategoriId: body.kategoriId || null,
      isPublished: !!body.isPublished,
    },
  });

  const newlyPublished = berita.isPublished && !existing?.isPublished;
  if (newlyPublished) {
    await kirimNotifikasiBroadcast({
      tipe: "BERITA",
      judul: "Berita baru",
      pesan: `Berita baru: ${berita.judul}`,
      link: `/berita/${berita.slug}`,
    });
  }

  return NextResponse.json(berita);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageBerita) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.berita.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
