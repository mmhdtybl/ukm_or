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
*{margin:0;padding:0;box-sizing:border-box}
#splash-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#0a0e1a;overflow:hidden;transition:opacity .7s ease}
@media(prefers-color-scheme:light){#splash-loader{background:linear-gradient(180deg,#0a0e1a 0%,#111827 100%)}}

/* === KOMET BIRU (dari kiri bawah) === */
.comet-blue{position:absolute;width:18px;height:18px;border-radius:50%;background:#4DA3FF;box-shadow:0 0 8px 2px #4DA3FF,0 0 20px 6px rgba(77,163,255,.7),0 0 40px 12px rgba(77,163,255,.4),0 0 70px 20px rgba(77,163,255,.2);animation:cometBlue 2s cubic-bezier(.23,1,.32,1) forwards;opacity:0}
.comet-blue::after{content:'';position:absolute;top:50%;right:100%;width:120px;height:4px;margin-top:-2px;border-radius:4px;background:linear-gradient(90deg,transparent,rgba(77,163,255,.6),#4DA3FF);filter:blur(2px);transform-origin:right center}
@keyframes cometBlue{
  0%{transform:translate(-55vw,55vh) scale(.4);opacity:0}
  10%{opacity:1}
  50%{transform:translate(-4vw,4vh) scale(.9);opacity:1}
  65%{transform:translate(0,0) scale(1.2);opacity:.9}
  80%{transform:translate(0,0) scale(.3);opacity:0}
  100%{transform:translate(0,0) scale(0);opacity:0}
}

/* === KOMET KUNING (dari kanan bawah) === */
.comet-yellow{position:absolute;width:18px;height:18px;border-radius:50%;background:#FFD60A;box-shadow:0 0 8px 2px #FFD60A,0 0 20px 6px rgba(255,214,10,.7),0 0 40px 12px rgba(255,214,10,.4),0 0 70px 20px rgba(255,214,10,.2);animation:cometYellow 2s cubic-bezier(.23,1,.32,1) forwards;opacity:0}
.comet-yellow::after{content:'';position:absolute;top:50%;left:100%;width:120px;height:4px;margin-top:-2px;border-radius:4px;background:linear-gradient(270deg,transparent,rgba(255,214,10,.6),#FFD60A);filter:blur(2px);transform-origin:left center}
@keyframes cometYellow{
  0%{transform:translate(55vw,55vh) scale(.4);opacity:0}
  10%{opacity:1}
  50%{transform:translate(4vw,4vh) scale(.9);opacity:1}
  65%{transform:translate(0,0) scale(1.2);opacity:.9}
  80%{transform:translate(0,0) scale(.3);opacity:0}
  100%{transform:translate(0,0) scale(0);opacity:0}
}

/* === LEDAKAN CAHAYA SAAT BERTemu === */
.burst{position:absolute;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.9),rgba(77,163,255,.4),rgba(255,214,10,.3),transparent);animation:burstAnim 1.2s ease-out 1.6s forwards;opacity:0;transform:scale(0)}
@keyframes burstAnim{
  0%{transform:scale(0);opacity:0}
  30%{transform:scale(1);opacity:1}
  100%{transform:scale(8);opacity:0}
}

/* === LOGO MUNCUL === */
.splash-logo{position:relative;z-index:10;width:110px;height:110px;border-radius:28px;background:#fff;padding:10px;object-fit:contain;box-shadow:0 8px 40px rgba(0,113,227,.3),0 0 80px rgba(255,214,10,.15);animation:logoReveal 1s ease-out 2s forwards;opacity:0;transform:scale(.5)}
@keyframes logoReveal{
  0%{opacity:0;transform:scale(.5)}
  60%{opacity:1;transform:scale(1.08)}
  100%{opacity:1;transform:scale(1)}
}

/* === GLOW RESIDU DI TENGAH === */
.glow-residue{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(77,163,255,.2),rgba(255,214,10,.1),transparent 70%);animation:residue 2.5s ease-out 1.8s forwards;opacity:0;transform:scale(0)}
@keyframes residue{
  0%{opacity:0;transform:scale(0)}
  40%{opacity:.7;transform:scale(1)}
  100%{opacity:0;transform:scale(2)}
}

/* === TEKS NAMA SETELAH LOGO === */
.splash-title{position:absolute;z-index:10;bottom:28%;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.7);animation:titleIn .8s ease-out 2.6s forwards;opacity:0;transform:translateY(8px)}
@media(prefers-color-scheme:light){.splash-title{color:rgba(255,255,255,.8)}}
@keyframes titleIn{
  0%{opacity:0;transform:translateY(8px)}
  100%{opacity:1;transform:translateY(0)}
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
      </head>
      <body className={`${poppins.variable} ${inter.variable}`}>
        <div id="splash-loader">
          <div className="comet-blue" />
          <div className="comet-yellow" />
          <div className="burst" />
          <div className="glow-residue" />
          <img src="/branding/logo-ukm.png" alt="UKM Olahraga" className="splash-logo" />
          <span className="splash-title">UKM Olahraga</span>
        </div>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `var t0=Date.now(),min=2500;window.addEventListener("load",function(){var r=Math.max(0,min-(Date.now()-t0));setTimeout(function(){var s=document.getElementById("splash-loader");if(s){s.style.opacity="0";setTimeout(function(){s.remove()},700)}},r)});`,
          }}
        />
      </body>
    </html>
  );
}
