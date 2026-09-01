import Link from "next/link";
import { formatUang } from "@/lib/utils";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import type { StatusKasBulanan } from "@/lib/kas";

export default function KasNotifCard({
  nama,
  status,
}: {
  nama: string;
  status: StatusKasBulanan;
}) {
  const { bayarBulanIni, bayarBulanLalu, sumBulanIni, sumBulanLalu, namaBulanIni, namaBulanLalu } = status;

  // Sudah bayar bulan ini dan bulan lalu: sembunyikan notifikasi
  if (bayarBulanIni && bayarBulanLalu) return null;

  // Prioritas: jika bulan lalu belum bayar, harus bayar bulan lalu dulu
  const harusBayarBulanLalu = !bayarBulanLalu;
  const bulanTagihan = harusBayarBulanLalu ? namaBulanLalu : namaBulanIni;
  const sudahBayar = harusBayarBulanLalu ? sumBulanLalu : sumBulanIni;

  return (
    <div className="card flex flex-col gap-3 border-orange-300 dark:border-orange-700 sm:flex-row sm:items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30">
          <FiAlertCircle size={22} />
        </div>
        <div>
          <p className="font-semibold">
            {nama}, Anda belum membayar kas{" "}
            {harusBayarBulanLalu ? "bulan lalu" : "bulan ini"}
          </p>
          <p className="text-sm text-slate-500">
            {harusBayarBulanLalu
              ? `Kas bulan ${namaBulanLalu} belum dibayar. Bayar bulan lalu terlebih dahulu sebelum bulan ini.`
              : `Kas bulan ${namaBulanIni} belum dibayar.`}{" "}
            (Rp5.000/bulan · sudah terbayar {formatUang(sudahBayar)})
          </p>
        </div>
      </div>

      <Link href="/akun-saya/kas" className="btn-primary shrink-0">
        Bayar Kas {bulanTagihan}
      </Link>
    </div>
  );
}
