import slugify from "slugify";

export function makeSlug(text: string) {
  return slugify(text, { lower: true, strict: true }) + "-" + Math.random().toString(36).slice(2, 7);
}

export function formatTanggal(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTanggalWaktu(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUang(jumlah: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(jumlah);
}
