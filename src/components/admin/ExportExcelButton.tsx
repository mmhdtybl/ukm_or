"use client";

import * as XLSX from "xlsx";
import { FiDownload } from "react-icons/fi";

export default function ExportExcelButton({
  filename,
  headers,
  rows,
  label = "Unduh Excel",
}: {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  label?: string;
}) {
  function handleExport() {
    const data = [headers, ...rows.map((row) => row.map((cell) => cell ?? ""))];
    const ws = XLSX.utils.aoa_to_sheet(data);

    ws["!cols"] = headers.map((_, i) => {
      const maxLen = Math.max(
        headers[i].length,
        ...rows.map((row) => String(row[i] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, filename);
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