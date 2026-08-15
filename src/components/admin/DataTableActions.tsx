"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function DataTableActions({ editHref, deleteUrl }: { editHref?: string; deleteUrl: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    setLoading(true);
    await fetch(deleteUrl, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {editHref && (
        <Link href={editHref} className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
          <FiEdit2 size={14} />
        </Link>
      )}
      <button disabled={loading} onClick={handleDelete} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
        <FiTrash2 size={14} />
      </button>
    </div>
  );
}
