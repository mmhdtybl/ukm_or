"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBell, FiCheckCircle, FiCamera, FiFileText, FiCalendar, FiCheck, FiSmartphone } from "react-icons/fi";

type NotifItem = {
  id: string;
  tipe: string;
  judul: string;
  pesan: string;
  link: string | null;
  dibaca: boolean;
  createdAt: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

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
  const [pushAktif, setPushAktif] = useState<boolean | null>(null);
  const [pushMsg, setPushMsg] = useState("");
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
    cekPush();
    const id = setInterval(muat, 45000);
    const focus = () => muat();
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", focus);
    };
  }, [muat]);

  const cekPush = useCallback(async () => {
    const didukung =
      "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
    if (!didukung) {
      setPushAktif(false);
      setPushMsg("Perangkat ini tidak mendukung notifikasi push.");
      return;
    }
    try {
      const res = await fetch("/api/push/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPushAktif(data.subscribed && Notification.permission === "granted");
      }
    } catch {
      /* abaikan */
    }
  }, []);

  const togglePush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushMsg("Perangkat ini tidak mendukung notifikasi push.");
      setPushAktif(false);
      return;
    }

    // Jika sudah aktif → matikan (unsubscribe)
    const reg = await navigator.serviceWorker.getRegistration();
    const existingSub = reg ? await reg.pushManager.getSubscription() : null;
    if (pushAktif || existingSub) {
      if (existingSub) {
        const endpoint = existingSub.endpoint;
        await existingSub.unsubscribe();
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, { method: "DELETE" });
      }
      setPushAktif(false);
      setPushMsg("");
      return;
    }

    // Aktifkan → minta izin
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setPushMsg("Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setPushMsg("Kunci push belum dikonfigurasi.");
      return;
    }

    const registration =
      reg && reg.scope.includes("/")
        ? reg
        : await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    setPushAktif(true);
    setPushMsg("");
  }, [pushAktif]);

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

          {pushAktif !== null && (
            <button
              onClick={togglePush}
              className="
                flex
                w-full
                items-center
                justify-between

                border-b
                border-slate-200/70
                px-4
                py-2.5

                text-left

                transition

                hover:bg-slate-50
                dark:border-white/10
                dark:hover:bg-white/5
              "
            >
              <span className="flex items-center gap-2.5">
                <FiSmartphone size={15} className="text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Notifikasi di HP
                </span>
              </span>
              <span
                className={`
                  relative
                  h-5
                  w-9
                  rounded-full

                  transition-colors
                  ${pushAktif ? "bg-primary" : "bg-slate-300 dark:bg-white/20"}
                `}
              >
                <span
                  className={`
                    absolute
                    top-0.5
                    h-4
                    w-4
                    rounded-full
                    bg-white
                    shadow

                    transition-transform

                    ${pushAktif ? "translate-x-[18px]" : "translate-x-0.5"}
                  `}
                />
              </span>
            </button>
          )}
          {pushMsg && (
            <p className="border-b border-slate-200/70 px-4 py-2 text-[11px] text-slate-400 dark:border-white/10">
              {pushMsg}
            </p>
          )}

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