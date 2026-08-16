import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMail,
  templatePendaftaranDikirim,
} from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  nama: z.string().min(2),
  nim: z.string().min(3),
  email: z.string().email(),
  noHp: z.string().min(8),
  prodi: z.string().min(2),
  angkatan: z.string().min(2),
  motivasi: z.string().min(5),
  divisiPilihan: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("BODY PENDAFTARAN:", body);

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
          email: data.email,
          noHp: data.noHp,
          prodi: data.prodi,
          angkatan: data.angkatan,
          motivasi: data.motivasi,
          divisiPilihan: data.divisiPilihan,
          tahap: "PRADIKSAR_1",
          status: "PENDING",
        },
      });

    const [profil, linkPradiksar1] = await Promise.all([
      prisma.profilUKM.findFirst(),
      prisma.linkWhatsApp.findUnique({
        where: { tahap: "PRADIKSAR_1" },
      }),
    ]);

    const namaUKM =
      profil?.namaUKM ||
      "UKM Olahraga Unimma";

    const emailSent = await sendMail(
      pendaftaran.email,
      `Pendaftaran Pradiksar 1 - ${namaUKM}`,
      templatePendaftaranDikirim(
        pendaftaran.nama,
        namaUKM,
        linkPradiksar1?.link
      )
    );

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Pendaftaran berhasil. Email konfirmasi telah dikirim."
          : "Pendaftaran berhasil, tetapi email konfirmasi gagal dikirim.",
        data: pendaftaran,
        emailTerkirim: emailSent,
        emailTujuan: pendaftaran.email,
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
