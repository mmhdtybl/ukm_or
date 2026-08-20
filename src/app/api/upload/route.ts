import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "File tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          message: "File kosong.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: "Ukuran file maksimal 4 MB.",
        },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.",
        },
        { status: 400 }
      );
    }

    const filename =
      file.name.replace(/[^a-zA-Z0-9._-]/g, "-") ||
      "upload.jpg";

    const pathname = `uploads/${Date.now()}-${filename}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json(
      {
        url: blob.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Gagal mengunggah ke Vercel Blob:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Upload gagal. Pastikan BLOB_READ_WRITE_TOKEN sudah diatur di Vercel.",
      },
      { status: 500 }
    );
  }
}