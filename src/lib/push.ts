import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@ukmolahraga.vercel.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export type PushPayload = {
  title: string;
  body: string;
  link?: string;
};

export function webPushInstance() {
  return webpush;
}

// Kirim push ke semua subscription milik satu user (dipakai untuk notif personal)
export async function kirimPush(userId: string, payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (err: any) {
      // Subscription kadaluarsa/ditolak → hapus
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
      }
      failed++;
    }
  }
  return { sent, failed };
}

// Kirim push broadcast ke semua subscription pengguna aktif
export async function kirimPushBroadcast(payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({
    where: { user: { isActive: true } },
  });
  if (subs.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
      }
      failed++;
    }
  }
  return { sent, failed };
}