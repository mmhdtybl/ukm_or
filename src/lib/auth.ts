import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        nim: { label: "NPM/NIM", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nim || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { nim: credentials.nim },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        const role = user.role as "ADMIN" | "PENGURUS" | "ANGGOTA";

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          image: user.avatar || undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.trim().toLowerCase();
      const nama = user.name?.trim() || "Pendaftar Google";

      if (!email) return "/login?google=error";

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser?.isActive) {
        // Gunakan identitas akun lokal agar role pada JWT tetap benar.
        user.id = existingUser.id;
        user.name = existingUser.name;
        user.email = existingUser.email;
        (user as any).role = existingUser.role;
        return true;
      }

      if (existingUser) return "/login?google=inactive";

      // Pengguna baru menyelesaikan NPM pada halaman pendaftaran Google.
      // Data baru dikirim ke dashboard admin setelah formulir itu dikirim.
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}

// Helper untuk mengecek role di server components / route handlers
export async function requireRole(roles: string[]) {
  const session = await auth();
  if (!session || !roles.includes((session.user as any).role)) {
    return null;
  }
  return session;
}
