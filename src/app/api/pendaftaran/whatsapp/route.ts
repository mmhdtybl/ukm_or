import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";

const TAHAP_VALID = ["PRADIKSAR", "DIKSAR"] as const;

export async function PUT(req: NextRequest) {
  const kap = await getKapabilitas();
  if (!kap?.canManageAnggota) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  const { links } = await req.json();
  if (!links || typeof links !== "object") {
    return NextResponse.json({ message: "Data link tidak valid." }, { status: 400 });
  }

  await prisma.$transaction([
    ...TAHAP_VALID.map((tahap) => {
      const link = typeof links[tahap] === "string" ? links[tahap].trim() : "";
      return link
        ? prisma.linkWhatsApp.upsert({
            where: { tahap },
            create: { tahap, link },
            update: { link },
          })
        : prisma.linkWhatsApp.deleteMany({ where: { tahap } });
    }),
    prisma.linkWhatsApp.deleteMany({ where: { tahap: { in: ["PRADIKSAR_1", "PRADIKSAR_2"] } } }),
  ]);

  return NextResponse.json({ success: true });
}
