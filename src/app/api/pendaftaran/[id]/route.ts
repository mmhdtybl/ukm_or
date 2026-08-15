import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKapabilitas } from "@/lib/permissions";
import { sendMail, templatePendaftaranDitolak } from "@/lib/email";

// PATCH: setujui / tolak pendaftaran anggota baru.
// Pendaftaran yang DITERIMA TIDAK otomatis membuat akun login — pendaftar akan dikirimi
// link grup WhatsApp untuk bergabung terlebih dahulu. Akun login dibuatkan manual belakangan
// oleh Admin/Ketua/Wakil/Bidang SDM (atau Kadiv untuk staff divisinya) melalui menu Kelola Anggota.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageAnggota) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });

  const { status } = await req.json(); // "DITERIMA" | "DITOLAK"

  const pendaftaran = await prisma.pendaftaran.update({
    where: { id: params.id },
    data: { status },
  });

  const profil = await prisma.profilUKM.findFirst();
  const namaUKM = profil?.namaUKM || "UKM Olahraga Unimma";

  if (status === "DITERIMA") {
    const waSection = profil?.waGroupLink
      ? `<p>Silakan bergabung ke grup WhatsApp resmi kami melalui link berikut:</p>
         <p><a href="${profil.waGroupLink}" style="color:#0F4C81;font-weight:bold">${profil.waGroupLink}</a></p>
         <p>Setelah bergabung, panitia akan membuatkan akun login website untuk Anda.</p>`
      : `<p>Panitia akan segera menghubungi Anda melalui WhatsApp/kontak yang Anda daftarkan untuk info bergabung lebih lanjut.</p>`;

    await sendMail(
      pendaftaran.email,
      `Pendaftaran Anggota ${namaUKM} Diterima`,
      `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0F4C81">Selamat, ${pendaftaran.nama}!</h2>
        <p>Pendaftaran Anda sebagai anggota <b>${namaUKM}</b> telah <b style="color:#16a34a">DITERIMA</b>.</p>
        ${waSection}
      </div>`
    );
  } else if (status === "DITOLAK") {
    await sendMail(
      pendaftaran.email,
      `Pendaftaran Anggota ${namaUKM}`,
      templatePendaftaranDitolak(pendaftaran.nama, namaUKM)
    );
  }

  return NextResponse.json(pendaftaran);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const kap = await getKapabilitas();
  if (!kap?.canManageAnggota) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  await prisma.pendaftaran.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
