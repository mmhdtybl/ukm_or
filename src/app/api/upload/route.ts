import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // Batas aman untuk upload lewat Vercel Function.

// File disimpan di Vercel Blob, bukan filesystem deployment yang bersifat sementara.
// Rute ini dapat digunakan semua pengguna yang sudah login.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "Ukuran file maksimal 4 MB." }, { status: 413 });
  }

  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-") || "upload";
  const pathname = `uploads/${Date.now()}-${filename}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Gagal mengunggah ke Vercel Blob:", error);
    return NextResponse.json(
      { message: "Upload gagal. Pastikan BLOB_READ_WRITE_TOKEN sudah diatur di Vercel." },
      { status: 500 }
    );
  }
}
