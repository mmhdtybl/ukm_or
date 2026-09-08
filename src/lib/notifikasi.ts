import { prisma } from "@/lib/prisma";
import { kirimPush, kirimPushBroadcast } from "@/lib/push";

export type TipeNotifikasi = "KAS" | "PRESENSI" | "BERITA" | "AGENDA";

export async function kirimNotifikasi(data: {
  userId: string;
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  link?: string;
}) {
  const notif = await prisma.notifikasi.create({ data });

  // Kirim juga push ke HP (jika pengguna sudah izinkan + subscribe)
  kirimPush(data.userId, {
    title: data.judul,
    body: data.pesan,
    link: data.link || "/",
  }).catch(() => {});

  return notif;
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
  if (users.length > 0) {
    await prisma.notifikasi.createMany({
      data: users.map((u) => ({ userId: u.id, ...data })),
    });
  }

  // Push broadcast ke HP semua subscriber
  kirimPushBroadcast({
    title: data.judul,
    body: data.pesan,
    link: data.link || "/",
  }).catch(() => {});
}