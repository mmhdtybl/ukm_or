import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { sendMail } from "@/lib/email";
import bcrypt from "bcryptjs";

// Membuat akun login (User) untuk anggota yang sudah bergabung di grup WhatsApp.
// Dipanggil manual oleh Admin/Ketua/Wakil/Bidang SDM, atau Kadiv untuk staff divisinya sendiri.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const anggota = await prisma.anggota.findUnique({ where: { id: params.id } });
  if (!anggota) return NextResponse.json({ message: "Anggota tidak ditemukan" }, { status: 404 });

  const bolehBuat = kap.canManageAnggota || (kap.canManageDivisiStaff && kap.divisiScope === anggota.divisi);
  if (!bolehBuat) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  if (anggota.userId) return NextResponse.json({ message: "Anggota ini sudah memiliki akun login." }, { status: 400 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "Email wajib diisi untuk mengirim kredensial." }, { status: 400 });

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ nim: anggota.nim }, { email }] } });
  if (existingUser) return NextResponse.json({ message: "NIM atau email ini sudah dipakai akun lain." }, { status: 400 });

  const randomPassword = Math.random().toString(36).slice(2, 10);
  const hashed = await bcrypt.hash(randomPassword, 10);

  const user = await prisma.user.create({
    data: { name: anggota.nama, nim: anggota.nim, email, password: hashed, role: "ANGGOTA" },
  });
  await prisma.anggota.update({ where: { id: anggota.id }, data: { userId: user.id } });

  await sendMail(
    email,
    "Akun Login UKM Olahraga Unimma",
    `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#0F4C81">Halo, ${anggota.nama}!</h2>
      <p>Akun login Anda untuk website UKM Olahraga Unimma telah dibuat:</p>
      <p><b>NPM/NIM:</b> ${anggota.nim}<br/><b>Password:</b> ${randomPassword}</p>
      <p>Segera login dan ganti password Anda.</p>
    </div>`
  );

  return NextResponse.json({ ok: true, nim: anggota.nim, password: randomPassword });
}
