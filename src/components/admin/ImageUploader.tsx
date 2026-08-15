"use client";

import { useState } from "react";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";

export default function ImageUploader({ value, onChange, label = "Gambar", circular = false }: { value: string; onChange: (url: string) => void; label?: string; circular?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);
    if (data.url) onChange(data.url);
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-4">
        <div className={`relative shrink-0 overflow-hidden bg-surface-light dark:bg-white/10 grid place-items-center ${circular ? "h-24 w-24 rounded-full" : "h-24 w-32 rounded-lg"}`}>
          {value ? <Image src={value} alt="preview" fill className="object-cover" /> : <FiUpload className="text-slate-400" />}
        </div>
        <label className="btn-outline !py-2 !px-4 text-sm cursor-pointer">
          {loading ? "Mengunggah..." : "Pilih File"}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}
