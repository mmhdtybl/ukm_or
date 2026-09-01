import Link from "next/link";
import { formatUang } from "@/lib/utils";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { TARGET_KAS, BULAN_KAS, KAS_PER_BULAN } from "@/lib/kas";

export default function KasNotifCard({
  terbayar,
  sisa,
  periode,
  nama,
}: {
  terbayar: number;
  sisa: number;
  periode: string;
  nama: string;
}) {
  const lunas = sisa <= 0;

  return (
    <div
      className={`card flex flex-col gap-3 sm:flex-row sm:items-center justify-between ${
        lunas ? "" : "border-orange-300 dark:border-orange-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            lunas
              ? "bg-green-100 text-green-600 dark:bg-green-900/30"
              : "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
          }`}
        >
          {lunas ? <FiCheckCircle size={22} /> : <FiAlertCircle size={22} />}
        </div>
        <div>
          <p className="font-semibold">
            {lunas
              ? `Pembayaran kas ${nama} lunas untuk periode ${periode}`
              : `Kas ${nama} belum lunas (periode ${periode})`}
          </p>
          <p className="text-sm text-slate-500">
            {lunas
              ? `Sudah membayar ${formatUang(terbayar)} dari target ${formatUang(TARGET_KAS)}.`
              : `Kekurangan ${formatUang(sisa)} lagi dari target kas ${formatUang(
                  TARGET_KAS
                )} (Rp${KAS_PER_BULAN.toLocaleString("id-ID")} × ${BULAN_KAS} bulan).`}
          </p>
        </div>
      </div>

      {!lunas && (
        <Link href="/akun-saya/kas" className="btn-primary shrink-0">
          Bayar Sekarang
        </Link>
      )}
    </div>
  );
}
