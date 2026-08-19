import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nomor = String(body.nomor || "").trim();
    const pesan = String(
      body.pesan ||
        "Halo, ini adalah pesan percobaan dari Sistem UKM."
    ).trim();

    if (!nomor) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor WhatsApp wajib diisi.",
        },
        { status: 400 }
      );
    }

    const token = process.env.FONNTE_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "FONNTE_TOKEN tidak ditemukan.",
        },
        { status: 500 }
      );
    }

    // Format nomor Indonesia
    let target = nomor.replace(/\D/g, "");

    if (target.startsWith("0")) {
      target = "62" + target.substring(1);
    } else if (target.startsWith("8")) {
      target = "62" + target;
    }

    console.log("Mengirim WhatsApp ke:", target);

    const formData = new FormData();

    formData.append("target", target);
    formData.append("message", pesan);
    formData.append("countryCode", "62");

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const result = await response.json();

    console.log("Fonnte response:", result);

    if (!response.ok || result.status !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "Fonnte gagal mengirim WhatsApp.",
          detail: result,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp berhasil dikirim melalui Fonnte.",
      nomor: target,
      detail: result,
    });
  } catch (error) {
    console.error("WhatsApp error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengirim WhatsApp.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}