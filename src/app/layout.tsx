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
  description:
    "Website resmi UKM Olahraga Universitas Muhammadiyah Magelang — wadah pengembangan minat dan bakat mahasiswa di bidang olahraga dan event.",
  manifest: "/manifest.json",
  icons: {
    apple: "/branding/logo-ukm.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "UKM Olahraga",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable}`}>
        <div id="splash-loader">
          <div className="splash-orb splash-orb-1" />
          <div className="splash-orb splash-orb-2" />
          <div className="splash-orb splash-orb-3" />
          <img src="/branding/logo-ukm.png" alt="UKM Olahraga" className="splash-logo" />
        </div>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener("load",function(){var s=document.getElementById("splash-loader");if(s){s.style.opacity="0";setTimeout(function(){s.remove()},600)}});`,
          }}
        />
      </body>
    </html>
  );
}
