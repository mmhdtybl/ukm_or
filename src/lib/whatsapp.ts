const FONNTE_ENDPOINT = "https://api.fonnte.com/send";

function normalisasiNomorWhatsApp(nomor: string) {
  const digits = nomor.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  return digits;
}

export async function kirimWhatsApp(
  nomor: string,
  pesan: string
) {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    console.error("❌ FONNTE_TOKEN belum dikonfigurasi.");
    return false;
  }

  const target = normalisasiNomorWhatsApp(nomor);

  if (!target || target.length < 10) {
    console.error("❌ Nomor WhatsApp tidak valid:", nomor);
    return false;
  }

  try {
    const response = await fetch(FONNTE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        target,
        message: pesan,
        countryCode: "62",
      }),
    });

    const hasil = (await response
      .json()
      .catch(() => null)) as {
      status?: boolean;
      detail?: string;
      reason?: string;
      id?: string;
    } | null;

    console.log("📱 Fonnte:", {
      statusHTTP: response.status,
      status: hasil?.status,
      target,
      detail: hasil?.detail,
    });

    if (!response.ok) {
      console.error(
        "❌ HTTP Error Fonnte:",
        response.status,
        hasil
      );

      return false;
    }

    if (hasil?.status !== true) {
      console.error(
        "❌ Fonnte gagal mengirim:",
        hasil?.detail || hasil?.reason || hasil
      );

      return false;
    }

    console.log(
      `✅ WhatsApp berhasil dikirim ke ${target}`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Gagal menghubungi Fonnte:",
      error
    );

    return false;
  }
}

export function pesanPendaftaranDikirim(
  _nama: string,
  _namaUKM: string,
  link?: string
) {
  return [
    "Terima kasih telah mendaftar di UKM Olahraga Unimma.",
    "Pendaftaranmu sudah kami terima dan akan ditinjau oleh tim.",
    link
      ? `Informasi Pradiksar 1 dan Pradiksar 2 silahkan gabung grup WhatsApp:\n${link}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function pesanLolosDiksar(link?: string) {
  return [
    "Selamat Anda lolos ke tahap selanjutnya yaitu Pendidikan Dasar.",
    link ? `Masuk grup WhatsApp:\n${link}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function pesanHasilPendaftaran(
  nama: string,
  namaUKM: string,
  tahapSaatIni: string,
  tahapBerikutnya?: string,
  link?: string
) {
  const labelTahap: Record<string, string> = {
    PRADIKSAR_1: "Pradiksar 1",
    PRADIKSAR_2: "Pradiksar 2",
    DIKSAR: "Diksar",
    SELESAI: "seluruh tahapan",
  };

  const tahap =
    labelTahap[tahapSaatIni] || tahapSaatIni;

  // Tidak lulus
  if (!tahapBerikutnya) {
    return [
      `Halo ${nama},`,
      "",
      `Terima kasih telah mengikuti seleksi ${namaUKM}.`,
      "",
      `Mohon maaf, kamu belum lulus pada tahap ${tahap}.`,
      "Tetap semangat dan sampai jumpa di kesempatan berikutnya.",
    ].join("\n");
  }

  const berikutnya =
    labelTahap[tahapBerikutnya] ||
    tahapBerikutnya;

  const pembuka =
    tahapBerikutnya === "SELESAI"
      ? `Selamat! Kamu dinyatakan lulus seluruh tahapan seleksi ${namaUKM}.`
      : `Selamat! Kamu lulus ${tahap} dan dapat melanjutkan ke ${berikutnya}.`;

  return [
    `Halo ${nama},`,
    "",
    pembuka,
    "",
    link
      ? `Link grup WhatsApp:\n${link}`
      : "",
    "",
    "Silakan ikuti informasi dari panitia melalui WhatsApp.",
  ]
    .filter(Boolean)
    .join("\n");
}
