"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Banner = { id: string; gambar: string; linkUrl?: string | null };

export default function HomeBannerCarousel({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);
  const total = banners.length;
  const move = (step: number) => setActive((current) => (current + step + total) % total);

  useEffect(() => {
    if (total < 2) return;
    const timer = window.setInterval(() => move(1), 10_000);
    return () => window.clearInterval(timer);
  }, [total]);

  if (!total) return <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600"><span className="text-sm">Banner UKM</span></div>;
  const banner = banners[active];
  const image = <Image key={banner.id} src={banner.gambar} alt="Banner UKM Olahraga" fill className="object-cover transition-opacity duration-500" priority={active === 0} />;

  return <div className="relative h-full w-full group">
    {banner.linkUrl ? <a href={banner.linkUrl} className="absolute inset-0 z-0 block" aria-label="Buka tautan banner">{image}</a> : image}
    {total > 1 && <>
      <button type="button" aria-label="Banner sebelumnya" onClick={() => move(-1)} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/65"><FiChevronLeft size={22} /></button>
      <button type="button" aria-label="Banner berikutnya" onClick={() => move(1)} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/65"><FiChevronRight size={22} /></button>
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">{banners.map((item, index) => <button key={item.id} type="button" aria-label={`Tampilkan banner ${index + 1}`} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white"}`} />)}</div>
    </>}
  </div>;
}
