"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";

export default function DarkModeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Ganti mode gelap/terang"
      className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 dark:border-slate-600 text-primary dark:text-accent hover:bg-slate-100 dark:hover:bg-white/10 transition"
    >
      {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
