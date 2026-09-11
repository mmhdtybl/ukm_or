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

const SPLASH_CSS = `
@keyframes pulseGlow{0%,100%{opacity:.55;filter:blur(60px)}50%{opacity:.95;filter:blur(80px)}}
@keyframes floatGlow{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-30px) scale(1.08)}66%{transform:translate(-25px,15px) scale(.95)}}
@keyframes floatGlowSlow{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-25px) scale(1.12)}}
@keyframes splashIn{0%{opacity:0;transform:scale(.65) translateY(16px)}100%{opacity:1;transform:scale(1) translateY(0)}}
#splash-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#FAFAFA;transition:opacity .6s ease}
@media(prefers-color-scheme:dark){#splash-loader{background:#1D1D1D}}
.splash-orb{position:absolute;border-radius:9999px;filter:blur(50px)}
.splash-orb-1{width:180px;height:180px;background:rgba(0,113,227,.35);animation:pulseGlow 3s ease-in-out infinite}
.splash-orb-2{width:140px;height:140px;background:rgba(77,163,255,.25);animation:floatGlow 6s ease-in-out infinite}
.splash-orb-3{width:120px;height:120px;background:rgba(255,149,0,.15);animation:floatGlowSlow 8s ease-in-out infinite}
.splash-logo{position:relative;z-index:2;width:100px;height:100px;object-fit:contain;filter:drop-shadow(0 4px 20px rgba(0,113,227,.3));animation:splashIn .8s ease-out}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
      </head>
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
