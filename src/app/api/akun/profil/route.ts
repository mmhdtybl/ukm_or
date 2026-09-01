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
  const { name, avatar, nim, password, prodi, divisi, jabatan, noHp, tanggalLahir, periode } = await req.json();

  const nama = typeof name === "string" ? name.trim() : "";
  const npm = typeof nim === "string" ? nim.trim() : "";
  const prodiStr = typeof prodi === "string" ? prodi.trim() : "";
  const divisiStr = typeof divisi === "string" ? divisi.trim() : "";
  const jabatanStr = typeof jabatan === "string" ? jabatan.trim() : "";
  const noHpStr = typeof noHp === "string" ? noHp.trim() : "";
  const periodeStr = typeof periode === "string" ? periode.trim() : "";
  const tanggalLahirDate =
    typeof tanggalLahir === "string" && tanggalLahir.trim()
      ? new Date(tanggalLahir.trim())
      : null;

  const role = (session.user as { role?: string }).role;

  // Cek role user
  const isAdmin = role === "ADMIN";

  // Validasi nama
  if (!nama) {
    return NextResponse.json(
      { message: "Nama wajib diisi" },
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

    // Persist data profil ke tabel Anggota/Pengurus sesuai peran akun
    if (role === "ANGGOTA" || role === "PENGURUS") {
      const dataUmum = {
        nama,
        prodi: prodiStr || undefined,
        noHp: noHpStr || null,
        tanggalLahir: tanggalLahirDate,
        foto: typeof avatar === "string" && avatar ? avatar : null,
      };

      if (role === "ANGGOTA") {
        await tx.anggota.updateMany({
          where: { userId },
          data: {
            ...dataUmum,
            divisi: divisiStr || null,
            periode: periodeStr || null,
          },
        });
      } else if (role === "PENGURUS") {
        await tx.pengurus.updateMany({
          where: { userId },
          data: {
            ...dataUmum,
            divisi: divisiStr || null,
            jabatan: jabatanStr || undefined,
            periodeMulai: periodeStr || undefined,
          },
        });
      }
    }

    return updated;
  });

  return NextResponse.json(user);
}