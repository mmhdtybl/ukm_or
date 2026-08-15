import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Layout khusus untuk seluruh halaman publik (termasuk halaman login).
// Setelah pengguna login, mereka diarahkan ke /dashboard atau /akun-saya
// yang memiliki layout sendiri (sidebar) tanpa Navbar/Footer publik ini.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="apple-page min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
