import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { kirimNotifikasi } from "@/lib/notifikasi";

// PATCH: verifikasi/tolak laporan kas dari anggota (khusus Bendahara/Ketua/Wakil/Admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageKeuangan) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const { status } = await req.json(); // DIVERIFIKASI / DITOLAK
  const existing = await prisma.keuangan.findUnique({
    where: { id: params.id },
    include: {
      anggota: { select: { userId: true, nama: true } },
      pengurus: { select: { userId: true, nama: true } },
    },
  });

  const item = await prisma.keuangan.update({ where: { id: params.id }, data: { status } });

  const userId = existing?.anggota?.userId || existing?.pengurus?.userId;
  if (userId) {
    const nama = existing?.anggota?.nama || existing?.pengurus?.nama || "Anggota";
    await kirimNotifikasi({
      userId,
      tipe: "KAS",
      judul: status === "DIVERIFIKASI" ? "Pembayaran kas diverifikasi" : "Pembayaran kas ditolak",
      pesan:
        status === "DIVERIFIKASI"
          ? `Pembayaran kas ${nama} sebesar Rp ${item.jumlah.toLocaleString("id-ID")} telah disetujui.`
          : `Pembayaran kas ${nama} sebesar Rp ${item.jumlah.toLocaleString("id-ID")} ditolak. Hubungi bendahara jika ada kendala.`,
      link: "/akun-saya/kas",
    });
  }

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageKeuangan) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  await prisma.keuangan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
