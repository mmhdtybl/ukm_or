"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBell, FiCheckCircle, FiCamera, FiFileText, FiCalendar, FiCheck } from "react-icons/fi";

type NotifItem = {
  id: string;
  tipe: string;
  judul: string;
  pesan: string;
  link: string | null;
  dibaca: boolean;
  createdAt: string;
};

const TIPE_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  KAS: { icon: FiCheckCircle, color: "text-emerald-500" },
  PRESENSI: { icon: FiCamera, color: "text-sky-500" },
  BERITA: { icon: FiFileText, color: "text-violet-500" },
  AGENDA: { icon: FiCalendar, color: "text-amber-500" },
};

function formatWaktu(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const muat = useCallback(async () => {
    try {
      const res = await fetch("/api/notifikasi", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setList(data.list);
      setUnread(data.unread);
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    muat();
    const id = setInterval(muat, 45000);
    const focus = () => muat();
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", focus);
    };
  }, [muat]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tandaiSemua = async () => {
    await fetch("/api/notifikasi", { method: "PATCH" });
    setList((l) => l.map((n) => ({ ...n, dibaca: true })));
    setUnread(0);
  };

  const buka = async (n: NotifItem) => {
    setOpen(false);
    if (!n.dibaca) {
      await fetch(`/api/notifikasi/${n.id}`, { method: "PATCH" });
      setUnread((u) => Math.max(0, u - 1));
      setList((l) => l.map((x) => (x.id === n.id ? { ...x, dibaca: true } : x)));
    }
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifikasi"
        className="
          relative
          flex
          h-9
          w-9
          items-center
          justify-center

          rounded-xl

          text-slate-600
          dark:text-slate-300

          transition

          hover:bg-slate-100
          dark:hover:bg-white/10
        "
      >
        <FiBell size={19} />
        {unread > 0 && (
          <span
            className="
              absolute
              -right-0.5
              -top-0.5

              flex
              h-4
              min-w-[18px]
              items-center
              justify-center

              rounded-full

              bg-red-500
              px-1

              text-[10px]
              font-bold
              text-white

              shadow
            "
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            top-11

            z-50

            w-[340px]
            max-w-[calc(100vw-2rem)]

            overflow-hidden

            rounded-2xl

            border
            border-white/70
            dark:border-white/10

            bg-white/95
            dark:bg-slate-900/95

            shadow-xl

            backdrop-blur-xl
          "
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Notifikasi</p>
            {unread > 0 && (
              <button
                onClick={tandaiSemua}
                className="
                  flex
                  items-center
                  gap-1

                  text-xs
                  font-medium

                  text-primary
                  hover:underline
                "
              >
                <FiCheck size={13} />
                Tandai semua
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
            {list.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Belum ada notifikasi.
              </p>
            ) : (
              list.map((n) => {
                const meta = TIPE_ICON[n.tipe] || TIPE_ICON.KAS;
                const Icon = meta.icon;
                const konten = (
                  <div
                    className={`
                      flex
                      gap-3
                      px-4
                      py-3

                      transition

                      hover:bg-slate-50
                      dark:hover:bg-white/5
                    `}
                  >
                    <span
                      className="
                        mt-0.5
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center

                        rounded-full

                        bg-slate-100
                        dark:bg-white/10
                      "
                    >
                      <Icon size={16} className={meta.color} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-semibold leading-snug text-slate-900 dark:text-white">
                          {n.judul}
                        </p>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatWaktu(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500 dark:text-slate-400">
                        {n.pesan}
                      </p>
                    </div>

                    {!n.dibaca && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => buka(n)}>
                    {konten}
                  </Link>
                ) : (
                  <a key={n.id} href="#" onClick={(e) => { e.preventDefault(); buka(n); }}>
                    {konten}
                  </a>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}