import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import {
  sendMail,
  templatePendaftaranLulus,
  templatePendaftaranDitolak,
} from "@/lib/email";

const TAHAP = {
  PRADIKSAR_1: "PRADIKSAR_1",
  PRADIKSAR_2: "PRADIKSAR_2",
  DIKSAR: "DIKSAR",
  SELESAI: "SELESAI",
} as const;

const STATUS = {
  PENDING: "PENDING",
  LULUS: "LULUS",
  TIDAK_LULUS: "TIDAK_LULUS",
} as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kap = await getKapabilitas();

    if (!kap?.canManageAnggota) {
      return NextResponse.json(
        { message: "Tidak diizinkan" },
        { status: 403 }
      );
    }

    const { status } = await req.json();

    if (
      status !== STATUS.LULUS &&
      status !== STATUS.TIDAK_LULUS
    ) {
      return NextResponse.json(
        {
          message: "Status harus LULUS atau TIDAK_LULUS.",
        },
        { status: 400 }
      );
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!pendaftaran) {
      return NextResponse.json(
        {
          message: "Data pendaftaran tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (pendaftaran.status !== STATUS.PENDING) {
      return NextResponse.json(
        {
          message: "Pendaftaran ini sudah memiliki keputusan.",
          data: pendaftaran,
        },
        { status: 400 }
      );
    }

    const [profil, linksWhatsApp] = await Promise.all([
      prisma.profilUKM.findFirst(),
      prisma.linkWhatsApp.findMany(),
    ]);

    const linkTahap = new Map(
      linksWhatsApp.map((item) => [item.tahap, item.link])
    );

    const namaUKM =
      profil?.namaUKM || "UKM Olahraga Unimma";

    /*
     * =====================================================
     * TIDAK LULUS
     * =====================================================
     */

    if (status === STATUS.TIDAK_LULUS) {
      const tahapSekarang =
        pendaftaran.tahap || TAHAP.PRADIKSAR_1;

      const updated = await prisma.pendaftaran.update({
        where: {
          id: pendaftaran.id,
        },
        data: {
          status: STATUS.TIDAK_LULUS,
        },
      });

      const emailSent = await sendMail(
        updated.email,
        `Hasil Seleksi ${namaUKM}`,
        templatePendaftaranDitolak(
          updated.nama,
          namaUKM,
          tahapSekarang
        )
      );

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Pendaftar dinyatakan tidak lulus dan email telah dikirim."
          : "Pendaftar dinyatakan tidak lulus, tetapi email gagal dikirim.",
        data: updated,
        emailTerkirim: emailSent,
        emailTujuan: updated.email,
      });
    }

    /*
     * =====================================================
     * PRADIKSAR 1 → PRADIKSAR 2
     * =====================================================
     */

    if (
      pendaftaran.tahap === TAHAP.PRADIKSAR_1 ||
      !pendaftaran.tahap
    ) {
      const updated = await prisma.pendaftaran.update({
        where: {
          id: pendaftaran.id,
        },
        data: {
          tahap: TAHAP.PRADIKSAR_2,
          status: STATUS.PENDING,
          tanggalPradiksar1: new Date(),
        },
      });

      const emailSent = await sendMail(
        updated.email,
        `Lulus Pradiksar 1 - ${namaUKM}`,
        templatePendaftaranLulus(
          updated.nama,
          namaUKM,
          TAHAP.PRADIKSAR_1,
          TAHAP.PRADIKSAR_2,
          linkTahap.get(TAHAP.PRADIKSAR_2)
        )
      );

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Lulus Pradiksar 1. Email Pradiksar 2 berhasil dikirim."
          : "Lulus Pradiksar 1, tetapi email gagal dikirim.",
        data: updated,
        emailTerkirim: emailSent,
        emailTujuan: updated.email,
      });
    }

    /*
     * =====================================================
     * PRADIKSAR 2 → DIKSAR
     * =====================================================
     */

    if (pendaftaran.tahap === TAHAP.PRADIKSAR_2) {
      const updated = await prisma.pendaftaran.update({
        where: {
          id: pendaftaran.id,
        },
        data: {
          tahap: TAHAP.DIKSAR,
          status: STATUS.PENDING,
          tanggalPradiksar2: new Date(),
        },
      });

      const emailSent = await sendMail(
        updated.email,
        `Lulus Pradiksar 2 - ${namaUKM}`,
        templatePendaftaranLulus(
          updated.nama,
          namaUKM,
          TAHAP.PRADIKSAR_2,
          TAHAP.DIKSAR,
          linkTahap.get(TAHAP.DIKSAR)
        )
      );

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Lulus Pradiksar 2. Email Diksar berhasil dikirim."
          : "Lulus Pradiksar 2, tetapi email gagal dikirim.",
        data: updated,
        emailTerkirim: emailSent,
        emailTujuan: updated.email,
      });
    }

    /*
     * =====================================================
     * DIKSAR → SELESAI / LULUS
     * =====================================================
     */

    if (pendaftaran.tahap === TAHAP.DIKSAR) {
      const waLink = profil?.waGroupLink || "";

      const updated = await prisma.pendaftaran.update({
        where: {
          id: pendaftaran.id,
        },
        data: {
          tahap: TAHAP.SELESAI,
          status: STATUS.LULUS,
          tanggalDiksar: new Date(),
          tanggalLulus: new Date(),
        },
      });

      const emailSent = await sendMail(
        updated.email,
        `🎉 Selamat! Anda Lulus Diksar - ${namaUKM}`,
        templatePendaftaranLulus(
          updated.nama,
          namaUKM,
          TAHAP.DIKSAR,
          TAHAP.SELESAI,
          waLink
        )
      );

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Pendaftar lulus seluruh proses dan email berhasil dikirim."
          : "Pendaftar lulus seluruh proses, tetapi email gagal dikirim.",
        data: updated,
        emailTerkirim: emailSent,
        emailTujuan: updated.email,
        whatsappLink: waLink || null,
      });
    }

    return NextResponse.json(
      {
        message: `Tahap pendaftaran tidak dikenali: ${pendaftaran.tahap}`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("ERROR UPDATE PENDAFTARAN:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses pendaftaran.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kap = await getKapabilitas();

    if (!kap?.canManageAnggota) {
      return NextResponse.json(
        { message: "Tidak diizinkan" },
        { status: 403 }
      );
    }

    await prisma.pendaftaran.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dihapus.",
    });
  } catch (error) {
    console.error("ERROR DELETE PENDAFTARAN:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus pendaftaran.",
      },
      { status: 500 }
    );
  }
}
