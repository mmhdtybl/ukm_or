"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function BackButton({ className = "", href }: { className?: string; href?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => href ? router.push(href) : router.back()}
      className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${className}`}
      aria-label="Kembali ke halaman sebelumnya"
      title="Kembali"
    >
      <FiArrowLeft size={18} />
      <span className="hidden sm:inline">Kembali</span>
    </button>
  );
}
