import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";
import { getPeriodeSekarang } from "@/lib/kas";

// GET: Bendahara/Ketua/Wakil/Admin melihat semua catatan keuangan.
// Anggota biasa hanya melihat riwayat kas miliknya sendiri.
export async function GET() {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  if (kap.canManageKeuangan) {
    const list = await prisma.keuangan.findMany({
      include: {
        anggota: { select: { nama: true, nim: true, divisi: true } },
        pengurus: { select: { nama: true, nim: true, divisi: true } },
        dicatatOleh: { select: { name: true } },
      },
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json(list);
  }

  // Pengurus non-admin/non-DPO / Anggota: hanya riwayat kas milik sendiri
  const userId = (session.user as any).id;
  const anggota = await prisma.anggota.findUnique({ where: { userId } });
  const pengurus = await prisma.pengurus.findUnique({ where: { userId } });

  const list = await prisma.keuangan.findMany({
    where: {
      OR: [
        ...(anggota ? [{ anggotaId: anggota.id }] : []),
        ...(pengurus ? [{ pengurusId: pengurus.id }] : []),
      ],
    },
    orderBy: { tanggal: "desc" },
  });
  return NextResponse.json(list);
}

// POST: Bendahara/Ketua/Wakil/Admin mencatat transaksi apa pun (langsung terverifikasi).
// Anggota biasa mengajukan laporan pembayaran kas pribadi (berstatus PENDING, menunggu verifikasi Bendahara).
export async function POST(req: NextRequest) {
  const session = await auth();
  const kap = await getKapabilitas();
  if (!session || !kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const body = await req.json();

  if (kap.canManageKeuangan) {
    const item = await prisma.keuangan.create({
      data: {
        jenis: body.jenis,
        kategori: body.kategori,
        jumlah: Number(body.jumlah),
        keterangan: body.keterangan || null,
        buktiUrl: body.buktiUrl || null,
        status: "DIVERIFIKASI",
        dicatatOlehId: (session.user as any).id,
        tanggal: body.tanggal ? new Date(body.tanggal) : new Date(),
      },
    });
    return NextResponse.json(item, { status: 201 });
  }

  if (kap.canKelolaKas || (!kap.isAdmin && !kap.isDPO)) {
    const userId = (session.user as any).id;
    const anggota = await prisma.anggota.findUnique({ where: { userId } });
    const pengurus = await prisma.pengurus.findUnique({ where: { userId } });

    if (!anggota && !pengurus) {
      return NextResponse.json({ message: "Akun ini tidak terhubung dengan data anggota/pengurus" }, { status: 400 });
    }

    const item = await prisma.keuangan.create({
      data: {
        jenis: "MASUK",
        kategori: body.kategori || "Kas Anggota",
        jumlah: Number(body.jumlah),
        keterangan: body.keterangan || null,
        buktiUrl: body.buktiUrl || null,
        metode: body.metode === "TRANSFER" ? "TRANSFER" : "OFFLINE",
        periode: getPeriodeSekarang(),
        bulanTagih: typeof body.bulanTagih === "string" ? body.bulanTagih : null,
        status: "PENDING",
        anggotaId: anggota?.id || null,
        pengurusId: pengurus?.id || null,
        tanggal: new Date(),
      },
    });
    return NextResponse.json(item, { status: 201 });
  }

  return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
}
