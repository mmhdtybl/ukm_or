import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getKapabilitas } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const agendaId =
      req.nextUrl.searchParams.get("agendaId");

    if (!agendaId) {
      return NextResponse.json(
        { message: "agendaId wajib diisi" },
        { status: 400 }
      );
    }

    const list = await prisma.absensiAnggota.findMany({
      where: {
        agendaId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        agenda: {
          select: {
            id: true,
            judul: true,
            tanggalMulai: true,
            lokasi: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const statistik = {
      total: list.length,
      hadir: list.filter(
        (a) => a.status === "HADIR"
      ).length,
      izin: list.filter(
        (a) => a.status === "IZIN"
      ).length,
    };

    return NextResponse.json({
      statistik,
      ranking: list.filter(
        (a) => a.status === "HADIR"
      ),
      data: list,
    });
  } catch (error) {
    console.error("GET /api/absensi:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data presensi.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const kap = await getKapabilitas();

    if (!kap?.canUploadPresensi) {
      return NextResponse.json(
        {
          message:
            "Role ini tidak dapat melakukan presensi.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      agendaId,
      status = "HADIR",
      fotoUrl,
      alasanIzin,
      keterangan,
    } = body;

    if (!agendaId) {
      return NextResponse.json(
        {
          message: "agendaId wajib diisi.",
        },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        {
          message: "ID pengguna tidak ditemukan.",
        },
        { status: 401 }
      );
    }

    if (!["HADIR", "IZIN"].includes(status)) {
      return NextResponse.json(
        {
          message: "Status tidak valid.",
        },
        { status: 400 }
      );
    }

    if (status === "HADIR" && !fotoUrl) {
      return NextResponse.json(
        {
          message: "Foto presensi wajib diunggah.",
        },
        { status: 400 }
      );
    }

    if (
      status === "IZIN" &&
      !alasanIzin?.trim()
    ) {
      return NextResponse.json(
        {
          message: "Alasan izin wajib diisi.",
        },
        { status: 400 }
      );
    }

    const agenda = await prisma.agenda.findUnique({
      where: {
        id: agendaId,
      },
    });

    if (!agenda) {
      return NextResponse.json(
        {
          message: "Kegiatan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const sudahAbsen =
      await prisma.absensiAnggota.findUnique({
        where: {
          agendaId_userId: {
            agendaId,
            userId,
          },
        },
      });

    if (sudahAbsen) {
      return NextResponse.json(
        {
          message:
            "Anda sudah melakukan presensi pada kegiatan ini.",
        },
        { status: 409 }
      );
    }

    const absensi =
      await prisma.absensiAnggota.create({
        data: {
          agendaId,
          userId,
          status,
          fotoUrl:
            status === "HADIR"
              ? fotoUrl
              : null,
          alasanIzin:
            status === "IZIN"
              ? alasanIzin
              : null,
          keterangan:
            keterangan || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          agenda: {
            select: {
              id: true,
              judul: true,
              tanggalMulai: true,
              lokasi: true,
            },
          },
        },
      });

    return NextResponse.json(
      absensi,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/absensi:", error);

    return NextResponse.json(
      {
        message: "Gagal menyimpan presensi.",
      },
      { status: 500 }
    );
  }
}