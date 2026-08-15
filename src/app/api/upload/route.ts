import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Upload file/gambar sederhana ke folder public/uploads.
// Dibuka untuk semua pengguna yang sudah login (banyak fitur perlu upload:
// foto presensi, bukti kas, foto barang, dsb), bukan hanya Admin/Pengurus.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
