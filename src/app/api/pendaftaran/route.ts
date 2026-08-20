import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kirimWhatsApp, pesanPendaftaranDikirim } from "@/lib/whatsapp";
import { z } from "zod";

const schema = z.object({
  nama: z.string().min(2),
  nim: z.string().min(3),
  noHp: z.string().min(8),
  prodi: z.string().min(2),
  angkatan: z.string().min(2),
  alamat: z.string().min(5),
  tanggalLahir: z.coerce.date(),
  motivasi: z.string().min(5),
  divisiPilihan: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      console.error(
        "VALIDASI GAGAL:",
        parsed.error.flatten()
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Mohon lengkapi semua data dengan benar.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.pendaftaran.findFirst({
      where: {
        nim: data.nim,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIM ini sudah memiliki pendaftaran yang sedang diproses.",
        },
        { status: 400 }
      );
    }

    const pendaftaran =
      await prisma.pendaftaran.create({
  data: {
    nama: data.nama,
    nim: data.nim,
    noHp: data.noHp,
    prodi: data.prodi,
    angkatan: data.angkatan,
    alamat: data.alamat,
    tanggalLahir: new Date(data.tanggalLahir),
    motivasi: data.motivasi,
    divisiPilihan: data.divisiPilihan,
    tahap: "PRADIKSAR_1",
    status: "PENDING",
  },
});

    const [profil, linkPradiksar] = await Promise.all([
      prisma.profilUKM.findFirst(),
      // Gunakan juga key lama agar link yang sudah dibuat sebelum migrasi
      // tetap terkirim saat pendaftar baru mengisi formulir.
      prisma.linkWhatsApp.findFirst({
        where: { tahap: { in: ["PRADIKSAR", "PRADIKSAR_1"] } },
        orderBy: { tahap: "asc" },
      }),
    ]);

    const namaUKM =
      profil?.namaUKM ||
      "UKM Olahraga Unimma";

    const whatsappTerkirim = await kirimWhatsApp(
      pendaftaran.noHp,
      pesanPendaftaranDikirim(
        pendaftaran.nama,
        namaUKM,
        linkPradiksar?.link
      )
    );

    return NextResponse.json(
      {
        success: true,
        message: whatsappTerkirim
          ? "Pendaftaran berhasil. Konfirmasi telah dikirim melalui WhatsApp."
          : "Pendaftaran berhasil, tetapi konfirmasi WhatsApp gagal dikirim.",
        data: pendaftaran,
        whatsappTerkirim,
        whatsappTujuan: pendaftaran.noHp,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ERROR API PENDAFTARAN:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server saat menyimpan pendaftaran.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const list =
      await prisma.pendaftaran.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(list);
  } catch (error) {
    console.error(
      "ERROR GET PENDAFTARAN:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil data pendaftaran.",
      },
      { status: 500 }
    );
  }
}
