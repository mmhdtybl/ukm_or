warning: in the working copy of '.env.example', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/(public)/login/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/(public)/pendaftaran/PendaftaranForm.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/api/pendaftaran/route.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/api/pengurus/[id]/route.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/api/pengurus/route.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/pendaftaran/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/admin/PendaftaranManager.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/auth.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/.env.example b/.env.example[m
[1mindex 2fc1435..c532163 100644[m
[1m--- a/.env.example[m
[1m+++ b/.env.example[m
[36m@@ -9,6 +9,10 @@[m [mDATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.c[m
 NEXTAUTH_URL="http://localhost:3000"[m
 NEXTAUTH_SECRET="ganti-dengan-random-secret-panjang"[m
 [m
[32m+[m[32m# Google OAuth (Google Cloud Console > APIs & Services > Credentials)[m
[32m+[m[32mGOOGLE_CLIENT_ID=""[m
[32m+[m[32mGOOGLE_CLIENT_SECRET=""[m
[32m+[m
 # Vercel Blob (buat Blob store di Vercel > Storage; token ditambahkan otomatis)[m
 BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."[m
 [m
[1mdiff --git a/prisma/schema.prisma b/prisma/schema.prisma[m
[1mindex a685319..8a384bb 100644[m
[1m--- a/prisma/schema.prisma[m
[1m+++ b/prisma/schema.prisma[m
[36m@@ -29,6 +29,20 @@[m [mmodel User {[m
   presensiDiunggah PresensiFoto[][m
 }[m
 [m
[32m+[m[32m// Permintaan akses yang dikirim dari tombol Google pada halaman login.[m
[32m+[m[32m// Admin meninjau data ini sebelum membuat akun anggota/pengurus.[m
[32m+[m[32mmodel PendaftaranGoogle {[m
[32m+[m[32m  id        String   @id @default(cuid())[m
[32m+[m[32m  nama      String[m
[32m+[m[32m  nim       String?[m
[32m+[m[32m  email     String   @unique[m
[32m+[m[32m  status    String   @default("PENDING")[m
[32m+[m[32m  createdAt DateTime @default(now())[m
[32m+[m[32m  updatedAt DateTime @default(now()) @updatedAt[m
[32m+[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m}[m
[32m+[m
 model Anggota {[m
   id             String           @id @default(cuid())[m
   userId         String?          @unique[m
[36m@@ -57,6 +71,7 @@[m [mmodel Pengurus {[m
   nama         String[m
   nim          String?[m
   prodi        String?[m
[32m+[m[32m  noHp         String?[m
   alamat       String?[m
   tanggalLahir DateTime?[m
   jabatan      String[m
[36m@@ -68,6 +83,7 @@[m [mmodel Pengurus {[m
   periodeAkhir String?[m
   urutan       Int      @default(0)[m
   isActive     Boolean  @default(true)[m
[32m+[m[32m  status       String   @default("Aktif")[m
   createdAt    DateTime @default(now())[m
   updatedAt    DateTime @default(now()) @updatedAt[m
   user         User?    @relation(fields: [userId], references: [id])[m
[1mdiff --git a/prisma/seed.ts b/prisma/seed.ts[m
[1mindex aa122b7..c88168b 100644[m
[1m--- a/prisma/seed.ts[m
[1m+++ b/prisma/seed.ts[m
[36m@@ -100,8 +100,8 @@[m [masync function main() {[m
       misi:[m
         "1. Membina dan mengembangkan potensi mahasiswa di berbagai cabang olahraga.\n2. Menyelenggarakan latihan rutin, kompetisi, dan event olahraga kampus.\n3. Membangun semangat sportivitas, kerja sama tim, dan kedisiplinan.\n4. Mengharumkan nama almamater melalui prestasi di bidang olahraga.",[m
       sejarah: "UKM Olahraga Unimma didirikan sebagai wadah bagi mahasiswa yang memiliki minat dan bakat di bidang olahraga untuk berkembang dan berprestasi.",[m
[31m-      alamat: "Gedung Kemahasiswaan, Universitas Muhammadiyah Magelang",[m
[31m-      email: "ukmolahraga@unimma.ac.id",[m
[32m+[m[32m      alamat: "Sekretariat UKM Olahraga Unimma,Kampus 2 Universitas Muhammadiyah Magelang, Jl. Mayjend Bambang Soegeng No. 1, Magelang, Jawa Tengah, Indonesia",[m
[32m+[m[32m      email: "ukmolahraga01@gmail.com",[m
       telepon: "0812-3456-7890",[m
       waGroupLink: "https://chat.whatsapp.com/contoh-link-grup-ukm",[m
     },[m
[1mdiff --git a/src/app/(public)/login/page.tsx b/src/app/(public)/login/page.tsx[m
[1mindex f6f5abd..d52fdd1 100644[m
[1m--- a/src/app/(public)/login/page.tsx[m
[1m+++ b/src/app/(public)/login/page.tsx[m
[36m@@ -1,6 +1,6 @@[m
 "use client";[m
 [m
[31m-import { useState } from "react";[m
[32m+[m[32mimport { useEffect, useState } from "react";[m
 import { signIn, getSession } from "next-auth/react";[m
 import { useRouter } from "next/navigation";[m
 import Link from "next/link";[m
[36m@@ -10,6 +10,18 @@[m [mexport default function LoginPage() {[m
   const router = useRouter();[m
   const [loading, setLoading] = useState(false);[m
   const [error, setError] = useState("");[m
[32m+[m[32m  const [info, setInfo] = useState("");[m
[32m+[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    const googleStatus = new URLSearchParams(window.location.search).get("google");[m
[32m+[m[32m    if (googleStatus === "registered") {[m
[32m+[m[32m      setInfo("Permintaan pendaftaran Google telah dikirim. Admin akan meninjau data Anda untuk pembuatan akun.");[m
[32m+[m[32m    } else if (googleStatus === "error") {[m
[32m+[m[32m      setError("Google tidak mengirimkan alamat email. Silakan gunakan akun Google lain.");[m
[32m+[m[32m    } else if (googleStatus === "inactive") {[m
[32m+[m[32m      setError("Akun Anda sedang tidak aktif. Hubungi admin UKM.");[m
[32m+[m[32m    }[m
[32m+[m[32m  }, []);[m
 [m
   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {[m
     e.preventDefault();[m
[36m@@ -59,6 +71,24 @@[m [mexport default function LoginPage() {[m
           {error && <p className="text-red-500 text-sm text-center">{error}</p>}[m
         </form>[m
 [m
[32m+[m[32m        <div className="flex items-center gap-3 my-5 text-xs text-slate-400">[m
[32m+[m[32m          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />[m
[32m+[m[32m          <span>atau</span>[m
[32m+[m[32m          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />[m
[32m+[m[32m        </div>[m
[32m+[m
[32m+[m[32m        <button[m
[32m+[m[32m          type="button"[m
[32m+[m[32m          disabled={loading}[m
[32m+[m[32m          onClick={() => signIn("google", { callbackUrl: "/pendaftaran/google" })}[m
[32m+[m[32m          className="btn-outline w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"[m
[32m+[m[32m        >[m
[32m+[m[32m          <span className="text-lg font-bold text-[#4285F4]">G</span>[m
[32m+[m[32m          Daftar atau masuk dengan Google[m
[32m+[m[32m        </button>[m
[32m+[m
[32m+[m[32m        {info && <p className="mt-4 text-sm text-center text-green-600">{info}</p>}[m
[32m+[m
         <p className="text-center text-sm text-slate-500 mt-6">[m
           Belum punya akun anggota?{" "}[m
           <Link href="/pendaftaran" className="text-primary dark:text-accent font-semibold">[m
[36m@@ -66,7 +96,7 @@[m [mexport default function LoginPage() {[m
           </Link>[m
         </p>[m
         <p className="text-center text-xs text-slate-400 mt-2">[m
[31m-          Email hanya digunakan saat pendaftaran akun, bukan untuk login.[m
[32m+[m[32m          Pendaftaran lewat Google meminta NPM/NIM setelah memilih akun Google, lalu dikirim ke admin.[m
         </p>[m
       </div>[m
     </div>[m
[1mdiff --git a/src/app/(public)/pendaftaran/PendaftaranForm.tsx b/src/app/(public)/pendaftaran/PendaftaranForm.tsx[m
[1mindex 7930f99..6bcd8d0 100644[m
[1m--- a/src/app/(public)/pendaftaran/PendaftaranForm.tsx[m
[1m+++ b/src/app/(public)/pendaftaran/PendaftaranForm.tsx[m
[36m@@ -26,6 +26,7 @@[m [mexport default function PendaftaranForm() {[m
     const payload = {[m
       nama: String(formData.get("nama") || "").trim(),[m
       nim: String(formData.get("nim") || "").trim(),[m
[32m+[m[32m      email: String(formData.get("email") || "").trim(),[m
       noHp: String(formData.get("noHp") || "").trim(),[m
       prodi: String(formData.get("prodi") || "").trim(),[m
       angkatan: String(formData.get("angkatan") || "").trim(),[m
[36m@@ -155,6 +156,11 @@[m [mexport default function PendaftaranForm() {[m
         </div>[m
       </div>[m
 [m
[32m+[m[32m      <div>[m
[32m+[m[32m        <label className="label">Email</label>[m
[32m+[m[32m        <input name="email" type="email" required className="input" placeholder="nama@email.com" />[m
[32m+[m[32m      </div>[m
[32m+[m
       <div>[m
         <label className="label">Alamat</label>[m
         <textarea name="alamat" required rows={3} className="input" placeholder="Alamat lengkap sesuai domisili" />[m
[1mdiff --git a/src/app/api/pendaftaran/route.ts b/src/app/api/pendaftaran/route.ts[m
[1mindex 207b6ae..5c69316 100644[m
[1m--- a/src/app/api/pendaftaran/route.ts[m
[1m+++ b/src/app/api/pendaftaran/route.ts[m
[36m@@ -6,6 +6,7 @@[m [mimport { z } from "zod";[m
 const schema = z.object({[m
   nama: z.string().min(2),[m
   nim: z.string().min(3),[m
[32m+[m[32m  email: z.string().trim().email(),[m
   noHp: z.string().min(8),[m
   prodi: z.string().min(2),[m
   angkatan: z.string().min(2),[m
[36m@@ -63,6 +64,7 @@[m [mexport async function POST(req: NextRequest) {[m
   data: {[m
     nama: data.nama,[m
     nim: data.nim,[m
[32m+[m[32m    email: data.email,[m
     noHp: data.noHp,[m
     prodi: data.prodi,[m
     angkatan: data.angkatan,[m
[36m@@ -70,7 +72,7 @@[m [mexport async function POST(req: NextRequest) {[m
     tanggalLahir: new Date(data.tanggalLahir),[m
     motivasi: data.motivasi,[m
     divisiPilihan: data.divisiPilihan,[m
[31m-    tahap: "PRADIKSAR_1",[m
[32m+[m[32m    tahap: "PRADIKSAR",[m
     status: "PENDING",[m
   },[m
 });[m
[1mdiff --git a/src/app/api/pengurus/[id]/route.ts b/src/app/api/pengurus/[id]/route.ts[m
[1mindex caf0ad7..6262697 100644[m
[1m--- a/src/app/api/pengurus/[id]/route.ts[m
[1m+++ b/src/app/api/pengurus/[id]/route.ts[m
[36m@@ -17,6 +17,7 @@[m [mexport async function PUT(req: NextRequest, { params }: { params: { id: string }[m
       nama: body.nama,[m
       nim: body.nim || null,[m
       prodi: body.prodi || null,[m
[32m+[m[32m      noHp: body.noHp || null,[m
       alamat: body.alamat || null,[m
       tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,[m
       jabatan: body.jabatan,[m
[36m@@ -28,6 +29,7 @@[m [mexport async function PUT(req: NextRequest, { params }: { params: { id: string }[m
       periodeAkhir: body.periodeAkhir || null,[m
       urutan: Number(body.urutan || 0),[m
       isActive: body.isActive ?? true,[m
[32m+[m[32m      status: body.status || "Aktif",[m
     },[m
   });[m
   return NextResponse.json(item);[m
[1mdiff --git a/src/app/api/pengurus/route.ts b/src/app/api/pengurus/route.ts[m
[1mindex 20039a3..a0d0348 100644[m
[1m--- a/src/app/api/pengurus/route.ts[m
[1m+++ b/src/app/api/pengurus/route.ts[m
[36m@@ -34,6 +34,7 @@[m [mexport async function POST(req: NextRequest) {[m
         nama: body.nama,[m
         nim: body.nim || null,[m
         prodi: body.prodi || null,[m
[32m+[m[32m        noHp: body.noHp || null,[m
         alamat: body.alamat || null,[m
         tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,[m
         jabatan: body.jabatan,[m
[36m@@ -45,6 +46,7 @@[m [mexport async function POST(req: NextRequest) {[m
         periodeAkhir: body.periodeAkhir || null,[m
         urutan: Number(body.urutan || 0),[m
         isActive: body.isActive ?? true,[m
[32m+[m[32m        status: body.status || "Aktif",[m
       },[m
     });[m
   });[m
[1mdiff --git a/src/app/dashboard/pendaftaran/page.tsx b/src/app/dashboard/pendaftaran/page.tsx[m
[1mindex 6165324..9daed3d 100644[m
[1m--- a/src/app/dashboard/pendaftaran/page.tsx[m
[1m+++ b/src/app/dashboard/pendaftaran/page.tsx[m
[36m@@ -9,9 +9,10 @@[m [mexport default async function KelolaPendaftaranPage() {[m
   const kap = await getKapabilitas();[m
   if (!kap?.canManageAnggota) redirect("/dashboard");[m
 [m
[31m-  const [pendaftaran, linkWhatsApp] = await Promise.all([[m
[32m+[m[32m  const [pendaftaran, linkWhatsApp, pendaftaranGoogle] = await Promise.all([[m
     prisma.pendaftaran.findMany({ orderBy: { createdAt: "desc" } }),[m
     prisma.linkWhatsApp.findMany(),[m
[32m+[m[32m    prisma.pendaftaranGoogle.findMany({ orderBy: { createdAt: "desc" } }),[m
   ]);[m
   return ([m
     <div>[m
[36m@@ -22,6 +23,7 @@[m [mexport default async function KelolaPendaftaranPage() {[m
       <PendaftaranManager[m
         initialData={JSON.parse(JSON.stringify(pendaftaran))}[m
         initialLinks={JSON.parse(JSON.stringify(linkWhatsApp))}[m
[32m+[m[32m        initialGoogleRequests={JSON.parse(JSON.stringify(pendaftaranGoogle))}[m
       />[m
     </div>[m
   );[m
[1mdiff --git a/src/components/admin/PendaftaranManager.tsx b/src/components/admin/PendaftaranManager.tsx[m
[1mindex 4902faf..c0611a8 100644[m
[1m--- a/src/components/admin/PendaftaranManager.tsx[m
[1m+++ b/src/components/admin/PendaftaranManager.tsx[m
[36m@@ -25,9 +25,11 @@[m [mconst tahapColor: Record<string, string> = {[m
 export default function PendaftaranManager({[m
   initialData,[m
   initialLinks,[m
[32m+[m[32m  initialGoogleRequests,[m
 }: {[m
   initialData: any[];[m
   initialLinks: any[];[m
[32m+[m[32m  initialGoogleRequests: any[];[m
 }) {[m
   const router = useRouter();[m
 [m
[36m@@ -41,6 +43,22 @@[m [mexport default function PendaftaranManager({[m
     return savedLinks;[m
   });[m
   const [savingLinks, setSavingLinks] = useState(false);[m
[32m+[m[32m  const [googleRequests, setGoogleRequests] = useState(initialGoogleRequests);[m
[32m+[m[32m  const [googleLoadingId, setGoogleLoadingId] = useState<string | null>(null);[m
[32m+[m
[32m+[m[32m  async function markGoogleRequestProcessed(id: string) {[m
[32m+[m[32m    setGoogleLoadingId(id);[m
[32m+[m[32m    try {[m
[32m+[m[32m      const response = await fetch(`/api/pendaftaran/google/${id}`, { method: "PATCH" });[m
[32m+[m[32m      const result = await response.json();[m
[32m+[m[32m      if (!response.ok) throw new Error(result.message || "Gagal memperbarui permintaan Google.");[m
[32m+[m[32m      setGoogleRequests((items) => items.map((item) => item.id === id ? { ...item, status: "SELESAI" } : item));[m
[32m+[m[32m    } catch (error) {[m
[32m+[m[32m      alert(error instanceof Error ? error.message : "Gagal memperbarui permintaan Google.");[m
[32m+[m[32m    } finally {[m
[32m+[m[32m      setGoogleLoadingId(null);[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
 [m
   async function saveLinks() {[m
     setSavingLinks(true);[m
[36m@@ -149,6 +167,25 @@[m [mexport default function PendaftaranManager({[m
 [m
   return ([m
     <div>[m
[32m+[m[32m      <div className="card mb-6 overflow-x-auto">[m
[32m+[m[32m        <div className="mb-4">[m
[32m+[m[32m          <h2 className="font-semibold">Permintaan Pendaftaran Google</h2>[m
[32m+[m[32m          <p className="text-sm text-slate-500 mt-1">Nama dan email dari Google. Buat akun melalui menu Kelola Akun, lalu tandai permintaan ini selesai.</p>[m
[32m+[m[32m        </div>[m
[32m+[m[32m        <table className="table-admin">[m
[32m+[m[32m          <thead><tr><th>Nama</th><th>Email</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>[m
[32m+[m[32m          <tbody>[m
[32m+[m[32m            {googleRequests.map((request) => <tr key={request.id}>[m
[32m+[m[32m              <td className="font-medium">{request.nama}</td>[m
[32m+[m[32m              <td>{request.email}</td>[m
[32m+[m[32m              <td>{formatTanggalWaktu(request.createdAt)}</td>[m
[32m+[m[32m              <td><span className={`badge ${request.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"}`}>{request.status === "PENDING" ? "Menunggu" : "Selesai"}</span></td>[m
[32m+[m[32m              <td>{request.status === "PENDING" ? <button disabled={googleLoadingId === request.id} onClick={() => markGoogleRequestProcessed(request.id)} className="text-xs font-semibold text-green-600 disabled:opacity-50">{googleLoadingId === request.id ? "Menyimpan..." : "Tandai selesai"}</button> : "-"}</td>[m
[32m+[m[32m            </tr>)}[m
[32m+[m[32m            {googleRequests.length === 0 && <tr><td colSpan={5} className="py-5 text-center text-slate-400">Belum ada permintaan dari Google.</td></tr>}[m
[32m+[m[32m          </tbody>[m
[32m+[m[32m        </table>[m
[32m+[m[32m      </div>[m
       <div className="card mb-6 space-y-4">[m
         <div>