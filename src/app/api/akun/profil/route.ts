import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await auth();

  // Pastikan user sudah login
  if (!session?.user) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu" },
      { status: 401 }
    );
  }

  // Ambil ID user dari session
  const userId = (session.user as { id?: string }).id;

  if (!userId) {
    return NextResponse.json(
      { message: "Data user tidak ditemukan" },
      { status: 401 }
    );
  }

  // Ambil data dari request
  const { name, email, avatar, nim, password } = await req.json();

  const nama = typeof name === "string" ? name.trim() : "";
  const surel =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const npm = typeof nim === "string" ? nim.trim() : "";

  // Cek role user
  const isAdmin =
    (session.user as { role?: string }).role === "ADMIN";

  // Validasi nama dan email
  if (!nama || !surel) {
    return NextResponse.json(
      { message: "Nama dan email wajib diisi" },
      { status: 400 }
    );
  }

  // Admin wajib mengisi NIM/NPM
  if (isAdmin && !npm) {
    return NextResponse.json(
      { message: "NPM/NIM wajib diisi" },
      { status: 400 }
    );
  }

  // User biasa tidak boleh mengubah NIM/NPM atau password
  if (
    !isAdmin &&
    (nim !== undefined || password !== undefined)
  ) {
    return NextResponse.json(
      {
        message:
          "Anda tidak diizinkan mengubah NPM/NIM atau password dari halaman profil.",
      },
      { status: 403 }
    );
  }

  // Validasi password admin
  if (
    isAdmin &&
    password !== undefined &&
    password !== null &&
    password !== ""
  ) {
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }
  }

  // Cek apakah email sudah digunakan akun lain
  const emailDipakai = await prisma.user.findFirst({
    where: {
      email: surel,
      NOT: {
        id: userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (emailDipakai) {
    return NextResponse.json(
      { message: "Email sudah digunakan oleh akun lain" },
      { status: 409 }
    );
  }

  // Admin: cek apakah NIM/NPM sudah digunakan akun lain
  if (isAdmin) {
    const nimDipakai = await prisma.user.findFirst({
      where: {
        nim: npm,
        NOT: {
          id: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (nimDipakai) {
      return NextResponse.json(
        { message: "NPM/NIM sudah digunakan oleh akun lain" },
        { status: 409 }
      );
    }
  }

  // Siapkan password baru jika admin mengubah password
  let hashedPassword: string | undefined;

  if (
    isAdmin &&
    typeof password === "string" &&
    password.trim() !== ""
  ) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update user dan data anggota dalam satu transaction
  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: {
        id: userId,
      },

      data: {
        name: nama,
        email: surel,

        avatar:
          typeof avatar === "string" && avatar
            ? avatar
            : null,

        // Hanya admin yang boleh mengubah NIM/NPM
        ...(isAdmin
          ? {
              nim: npm,
            }
          : {}),

        // Hanya update password jika admin benar-benar
        // mengirim password baru
        ...(hashedPassword
          ? {
              password: hashedPassword,
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        avatar: true,
      },
    });

    // Sinkronkan NIM/NPM admin dengan tabel Anggota
    if (isAdmin) {
      await tx.anggota.updateMany({
        where: {
          userId,
        },
        data: {
          nim: npm,
        },
      });
    }

    return updated;
  });

  return NextResponse.json(user);
}