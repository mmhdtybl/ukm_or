import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";
import { makeSlug } from "@/lib/utils";

export async function GET() {
  const list = await prisma.agenda.findMany({ orderBy: { tanggalMulai: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap?.canManageEvent) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();
  const agenda = await prisma.agenda.create({
    data: {
      judul: body.judul,
      slug: makeSlug(body.judul),
      deskripsi: body.deskripsi,
      lokasi: body.lokasi,
      tanggalMulai: new Date(body.tanggalMulai),
      tanggalSelesai: new Date(body.tanggalSelesai),
      gambar: body.gambar || null,
      status: body.status || "AKAN_DATANG",
      kuota: body.kuota ? Number(body.kuota) : null,
      penyelenggara: body.penyelenggara || null,
      dibuatOlehId: (session.user as any).id,
    },
  });
  return NextResponse.json(agenda, { status: 201 });
}
