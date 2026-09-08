import { prisma } from "@/lib/prisma";

export type TipeNotifikasi = "KAS" | "PRESENSI" | "BERITA" | "AGENDA";

export async function kirimNotifikasi(data: {
  userId: string;
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  link?: string;
}) {
  return prisma.notifikasi.create({ data });
}

export async function kirimNotifikasiBroadcast(data: {
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  link?: string;
}) {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  if (users.length === 0) return;

  await prisma.notifikasi.createMany({
    data: users.map((u) => ({ userId: u.id, ...data })),
  });
}