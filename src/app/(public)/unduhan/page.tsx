import { prisma } from "@/lib/prisma";
import { FiDownload, FiFile } from "react-icons/fi";

export const metadata = { title: "Unduhan File" };

export default async function UnduhanPage() {
  const files = await prisma.fileUnduhan.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container-page py-16">
      <span className="section-eyebrow">Dokumen Resmi</span>
      <h1 className="section-title mb-10">Unduhan File</h1>

      {files.length === 0 ? (
        <p className="text-slate-500">Belum ada file yang tersedia untuk diunduh.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {files.map((f) => (
            <a key={f.id} href={f.fileUrl} download className="card flex items-center gap-4 hover:shadow-lg transition">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-accent">
                <FiFile size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{f.judul}</p>
                <p className="text-xs text-slate-400">{f.kategori || "Dokumen"}</p>
              </div>
              <FiDownload className="text-primary dark:text-accent shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
