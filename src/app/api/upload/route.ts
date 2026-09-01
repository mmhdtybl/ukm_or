import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StorageClient } from "@supabase/storage-js";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

let storage: StorageClient | null = null;

function getStorage(): StorageClient {
  if (storage) return storage;
  const url = String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  storage = new StorageClient(`${url}/storage/v1`, {
    Authorization: `Bearer ${key}`,
    apiKey: key,
  });
  return storage;
}

// Supabase Storage dipakai di produksi (persisten). Bila kredensial belum
// tersedia, fallback ke filesystem lokal untuk pengembangan.
function pakaiSupabase(): boolean {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (key.includes("xxxxx") || key.includes("placeholder")) return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ message: "File kosong." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 10 MB." },
        { status: 413 }
      );
    }

    let ext = path.extname(file.name || "").toLowerCase();

    const mapType: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/heic": ".heic",
      "image/heif": ".heif",
      "image/heic-sequence": ".heic",
      "image/heif-sequence": ".heif",
    };

    if (!ALLOWED_EXT.includes(ext)) {
      ext = mapType[file.type] || (ext ? ext : "");
    }

    const mimeDipakai = ALLOWED_TYPES.includes(file.type);
    const extDipakai = ALLOWED_EXT.includes(ext);

    if (!mimeDipakai && !extDipakai) {
      return NextResponse.json(
        { message: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, HEIC, atau HEIF." },
        { status: 400 }
      );
    }

    if (!extDipakai) ext = mapType[file.type] || ".jpg";

    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;

    // ---- Produksi: Supabase Storage ----
    if (pakaiSupabase()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await getStorage()
        .from(BUCKET)
        .upload(filename, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return NextResponse.json(
          { message: "Upload gagal: " + (error.message || "Terjadi kesalahan.") },
          { status: 500 }
        );
      }

      const { data: publicData } = getStorage().from(BUCKET).getPublicUrl(data.path);

      return NextResponse.json({ url: publicData.publicUrl }, { status: 200 });
    }

    // ---- Pengembangan: filesystem lokal ----
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 200 });
  } catch (error) {
    console.error("Gagal mengunggah file:", error);
    return NextResponse.json(
      { message: "Upload gagal. Coba lagi." },
      { status: 500 }
    );
  }
}