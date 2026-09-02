"use client";

import { FiDownload } from "react-icons/fi";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[";\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export default function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Unduh CSV",
}: {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  label?: string;
}) {
  function handleExport() {
    const lines = [
      headers.map((h) => escapeCsv(h)).join(","),
      ...rows.map((row) =>
        row.map((cell) => escapeCsv(cell)).join(",")
      ),
    ];
    const csv = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="btn-outline !py-2 !px-4 text-sm inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <FiDownload size={14} />
      {label}
    </button>
  );
}