import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Gagal mengirim email:", err);
    return false;
  }
}

export function templatePendaftaranDiterima(nama: string, ukm: string) {
  return `
  <div style="font-family:sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#0F4C81">Selamat, ${nama}!</h2>
    <p>Pendaftaran Anda sebagai anggota <b>${ukm}</b> telah <b style="color:#16a34a">DITERIMA</b>.</p>
    <p>Silakan pantau agenda kegiatan dan informasi lebih lanjut melalui website resmi UKM. Sampai jumpa di kegiatan berikutnya!</p>
    <p style="margin-top:24px;color:#888;font-size:12px">Email ini dikirim otomatis, mohon tidak membalas.</p>
  </div>`;
}

export function templatePendaftaranDitolak(nama: string, ukm: string) {
  return `
  <div style="font-family:sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#0F4C81">Halo, ${nama}</h2>
    <p>Terima kasih telah mendaftar sebagai anggota <b>${ukm}</b>. Mohon maaf, saat ini pendaftaran Anda belum dapat kami terima.</p>
    <p>Jangan berkecil hati, kamu bisa mendaftar kembali pada periode berikutnya.</p>
  </div>`;
}
