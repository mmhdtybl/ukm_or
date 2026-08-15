import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    // Pengguna yang masih memiliki sesi tidak perlu melihat halaman login lagi.
    // Mereka hanya dapat kembali ke sana setelah sesi diakhiri melalui tombol Keluar.
    if (path === "/login" && role) {
      return NextResponse.redirect(new URL(role === "ANGGOTA" ? "/akun-saya" : "/dashboard", req.url));
    }

    // Area /dashboard hanya untuk ADMIN & PENGURUS
    if (path.startsWith("/dashboard")) {
      if (role !== "ADMIN" && role !== "PENGURUS") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Beberapa sub-menu khusus ADMIN saja
      const adminOnly = ["/dashboard/pengurus", "/dashboard/profil-ukm", "/dashboard/banner"];
      if (adminOnly.some((p) => path.startsWith(p)) && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Area /akun-saya untuk ANGGOTA (dan pengurus/admin juga boleh akses)
    if (path.startsWith("/akun-saya") && !role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/akun-saya/:path*", "/login"],
};
