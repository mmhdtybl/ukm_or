import { prisma } from "@/lib/prisma";

export async function getKasConfig() {
  return prisma.kasKonfigurasi.findFirst();
}
