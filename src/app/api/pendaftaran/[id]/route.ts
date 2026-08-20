import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { kirimWhatsApp, pesanHasilPendaftaran } from "@/lib/whatsapp";

const TAHAP = { PRADIKSAR: "PRADIKSAR", DIKSAR: "DIKSAR", SELESAI: "SELESAI" } as const;
const STATUS = { PENDING: "PENDING", LULUS: "LULUS", TIDAK_LULUS: "TIDAK_LULUS" } as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const kap = await getKapabilitas();
    if (!kap?.canManageAnggota) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

    const { status } = await req.json();
    if (status !== STATUS.LULUS && status !== STATUS.TIDAK_LULUS) {
      return NextResponse.json({ message: "Status harus LULUS atau TIDAK_LULUS." }, { status: 400 });
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({ where: { id: params.id } });
    if (!pendaftaran) return NextResponse.json({ message: "Data pendaftaran tidak ditemukan." }, { status: 404 });
    if (pendaftaran.status !== STATUS.PENDING) {
      return NextResponse.json({ message: "Pendaftaran ini sudah memiliki keputusan.", data: pendaftaran }, { status: 400 });
    }

    const [profil, linksWhatsApp] = await Promise.all([prisma.profilUKM.findFirst(), prisma.linkWhatsApp.findMany()]);
    const linkTahap = new Map(linksWhatsApp.map((item) => [item.tahap, item.link]));
    const namaUKM = profil?.namaUKM || "UKM Olahraga Unimma";
    const tahapSaatIni = pendaftaran.tahap || TAHAP.PRADIKSAR;

    if (status === STATUS.TIDAK_LULUS) {
      const updated = await prisma.pendaftaran.update({ where: { id: pendaftaran.id }, data: { status: STATUS.TIDAK_LULUS } });
      const whatsappTerkirim = await kirimWhatsApp(updated.noHp, pesanHasilPendaftaran(updated.nama, namaUKM, tahapSaatIni));
      return NextResponse.json({
        success: true,
        message: whatsappTerkirim ? "Pendaftar dinyatakan tidak lulus dan notifikasi WhatsApp telah dikirim." : "Pendaftar dinyatakan tidak lulus, tetapi notifikasi WhatsApp gagal dikirim.",
        data: updated, whatsappTerkirim, whatsappTujuan: updated.noHp,
      });
    }

    // Satu kelulusan Pradiksar gabungan langsung mengantar pendaftar ke Diksar.
    // Dua nilai lama tetap didukung agar data sebelum pembaruan tidak macet.
    if ([TAHAP.PRADIKSAR, "PRADIKSAR_1", "PRADIKSAR_2"].includes(tahapSaatIni)) {
      const updated = await prisma.pendaftaran.update({
        where: { id: pendaftaran.id },
        data: { tahap: TAHAP.DIKSAR, status: STATUS.PENDING, tanggalPradiksar1: new Date() },
      });
      const whatsappTerkirim = await kirimWhatsApp(
        updated.noHp,
        pesanHasilPendaftaran(updated.nama, namaUKM, TAHAP.PRADIKSAR, TAHAP.DIKSAR, linkTahap.get(TAHAP.DIKSAR))
      );
      return NextResponse.json({
        success: true,
        message: whatsappTerkirim ? "Lulus Pradiksar. Informasi dan link grup Diksar telah dikirim melalui WhatsApp." : "Lulus Pradiksar, tetapi notifikasi WhatsApp gagal dikirim.",
        data: updated, whatsappTerkirim, whatsappTujuan: updated.noHp,
      });
    }

    if (tahapSaatIni === TAHAP.DIKSAR) {
      const updated = await prisma.pendaftaran.update({
        where: { id: pendaftaran.id },
        data: { tahap: TAHAP.SELESAI, status: STATUS.LULUS, tanggalDiksar: new Date(), tanggalLulus: new Date() },
      });
      const whatsappTerkirim = await kirimWhatsApp(updated.noHp, pesanHasilPendaftaran(updated.nama, namaUKM, TAHAP.DIKSAR, TAHAP.SELESAI));
      return NextResponse.json({
        success: true,
        message: whatsappTerkirim ? "Pendaftar lulus Diksar dan resmi menjadi bagian dari keluarga UKM Olahraga Unimma." : "Pendaftar lulus Diksar, tetapi notifikasi WhatsApp gagal dikirim.",
        data: updated, whatsappTerkirim, whatsappTujuan: updated.noHp,
      });
    }

    return NextResponse.json({ message: `Tahap pendaftaran tidak dikenali: ${tahapSaatIni}` }, { status: 400 });
  } catch (error) {
    console.error("ERROR UPDATE PENDAFTARAN:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat memproses pendaftaran." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const kap = await getKapabilitas();
    if (!kap?.canManageAnggota) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
    await prisma.pendaftaran.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Pendaftaran berhasil dihapus." });
  } catch (error) {
    console.error("ERROR DELETE PENDAFTARAN:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus pendaftaran." }, { status: 500 });
  }
}
