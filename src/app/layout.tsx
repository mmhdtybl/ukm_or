import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "UKM Olahraga Unimma",
    template: "%s | UKM Olahraga Unimma",
  },
  description: "Website resmi UKM Olahraga Universitas Muhammadiyah Magelang — wadah pengembangan minat dan bakat mahasiswa di bidang olahraga dan event.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
