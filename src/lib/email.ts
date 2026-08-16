import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure:
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(
  to: string,
  subject: string,
  html: string
) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("SMTP_USER atau SMTP_PASSWORD belum diatur.");
      return false;
    }

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"UKM Kampus" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email berhasil dikirim ke: ${to}`);
    return true;
  } catch (error) {
    console.error(`Gagal mengirim email ke ${to}:`, error);
    return false;
  }
}

/* =====================================================
   TEMPLATE PENDAFTARAN AWAL
===================================================== */

export function templatePendaftaranDikirim(
  nama: string,
  ukm: string,
  waLink?: string
) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333">
    <div style="background:#0F4C81;padding:24px;text-align:center">
      <h2 style="color:white;margin:0">Pendaftaran ${ukm}</h2>
    </div>

    <div style="padding:25px">
      <h3>Halo, ${nama}!</h3>

      <p>
        Pendaftaran Anda sebagai calon anggota
        <b>${ukm}</b> telah berhasil kami terima.
      </p>

      <div style="background:#f3f4f6;padding:15px;border-radius:8px">
        <b>Tahap saat ini:</b><br/>
        Pradiksar 1
      </div>

      <p>
        Silakan mengikuti proses seleksi sesuai informasi
        dari panitia.
      </p>

      <p>
        Hasil seleksi akan dikirimkan melalui email ini.
      </p>

      ${
        waLink
          ? `
            <div style="background:#dcfce7;padding:18px;border-radius:10px;margin-top:20px">
              <b style="color:#15803d">Grup WhatsApp Pradiksar 1</b>
              <p>Silakan bergabung ke grup WhatsApp untuk informasi tahap Pradiksar 1.</p>
              <a href="${waLink}" style="display:inline-block;background:#16a34a;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Bergabung ke Grup WhatsApp</a>
            </div>
          `
          : ""
      }

      <p style="color:#888;font-size:12px;margin-top:30px">
        Email ini dikirim otomatis oleh sistem ${ukm}.
      </p>
    </div>
  </div>
  `;
}

/* =====================================================
   LULUS TAHAP
===================================================== */

export function templatePendaftaranLulus(
  nama: string,
  ukm: string,
  tahapSelesai: string,
  tahapBerikutnya: string,
  waLink?: string
) {
  const namaTahap: Record<string, string> = {
    PRADIKSAR_1: "Pradiksar 1",
    PRADIKSAR_2: "Pradiksar 2",
    DIKSAR: "Diksar",
    SELESAI: "Seluruh proses pendidikan",
  };

  const selesai =
    namaTahap[tahapSelesai] || tahapSelesai;

  const berikutnya =
    namaTahap[tahapBerikutnya] || tahapBerikutnya;

  const whatsappSection =
    waLink
      ? `
        <div style="
          background:#dcfce7;
          padding:20px;
          border-radius:10px;
          margin-top:20px;
        ">
          <h3 style="color:#15803d;margin-top:0">
            Grup WhatsApp ${berikutnya}
          </h3>

          <p>
            Silakan bergabung ke grup WhatsApp resmi
            ${ukm}.
          </p>

          <a
            href="${waLink}"
            style="
              display:inline-block;
              background:#16a34a;
              color:white;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
              font-weight:bold;
            "
          >
            Bergabung ke Grup WhatsApp
          </a>
        </div>
      `
      : "";

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333">

    <div style="background:#0F4C81;padding:24px;text-align:center">
      <h2 style="color:white;margin:0">
        Hasil Seleksi ${ukm}
      </h2>
    </div>

    <div style="padding:25px">

      <h3>
        Selamat, ${nama}! 🎉
      </h3>

      <p>
        Anda dinyatakan
        <b style="color:#16a34a">
          LULUS
        </b>
        pada tahap <b>${selesai}</b>.
      </p>

      ${
        tahapBerikutnya !== "SELESAI"
          ? `
            <div style="
              background:#eff6ff;
              padding:18px;
              border-radius:10px;
              margin-top:20px;
            ">
              <b>Tahap berikutnya:</b>
              <div style="
                font-size:20px;
                color:#0F4C81;
                font-weight:bold;
                margin-top:8px;
              ">
                ${berikutnya}
              </div>
            </div>
          `
          : `
            <div style="
              background:#dcfce7;
              padding:18px;
              border-radius:10px;
              margin-top:20px;
            ">
              <b style="color:#15803d">
                🎓 Selamat!
              </b>

              <p style="margin-bottom:0">
                Anda telah menyelesaikan seluruh proses
                seleksi dan dinyatakan sebagai anggota
                ${ukm}.
              </p>
            </div>
          `
      }

      ${whatsappSection}

      <p style="color:#888;font-size:12px;margin-top:30px">
        Email ini dikirim otomatis oleh sistem ${ukm}.
      </p>

    </div>
  </div>
  `;
}

/* =====================================================
   TIDAK LULUS
===================================================== */

export function templatePendaftaranDitolak(
  nama: string,
  ukm: string,
  tahap: string
) {
  const namaTahap: Record<string, string> = {
    PRADIKSAR_1: "Pradiksar 1",
    PRADIKSAR_2: "Pradiksar 2",
    DIKSAR: "Diksar",
  };

  const namaTahapFinal =
    namaTahap[tahap] || tahap;

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333">

    <div style="background:#0F4C81;padding:24px;text-align:center">
      <h2 style="color:white;margin:0">
        Hasil Seleksi ${ukm}
      </h2>
    </div>

    <div style="padding:25px">

      <h3>Halo, ${nama}</h3>

      <p>
        Terima kasih telah mengikuti proses seleksi
        ${ukm}.
      </p>

      <div style="
        background:#fee2e2;
        padding:18px;
        border-radius:10px;
        margin-top:20px;
      ">
        <b style="color:#dc2626">
          Mohon maaf, Anda belum lulus.
        </b>

        <p style="margin-bottom:0">
          Anda belum dapat melanjutkan proses setelah
          tahap <b>${namaTahapFinal}</b>.
        </p>
      </div>

      <p>
        Jangan berkecil hati. Anda dapat mengikuti
        kesempatan pendaftaran berikutnya sesuai
        ketentuan ${ukm}.
      </p>

      <p style="color:#888;font-size:12px;margin-top:30px">
        Email ini dikirim otomatis oleh sistem ${ukm}.
      </p>

    </div>
  </div>
  `;
}
