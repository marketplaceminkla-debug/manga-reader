import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavigationProgress from "@/components/NavigationProgress";
import LoadingScreen from "@/components/LoadingScreen";
import MangaFinnLogo from "@/components/MangaFinnLogo";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MangaFinn",
  description: "Baca koleksi komik pribadi.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen flex flex-col" style={{ background: "#0F1923", color: "#F8FAFC" }}>
        {/* Loading screen — hanya muncul sekali per sesi */}
        <LoadingScreen />

        {/* Progress bar navigasi */}
        <NavigationProgress />

        <header className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: "#1E2D3D", background: "rgba(15,25,35,0.85)" }}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group focus-ring rounded-lg pr-2">
              <MangaFinnLogo size={32} className="transition-transform duration-300 group-hover:rotate-3" />
              <span className="font-display text-xl tracking-wider" style={{ color: "#F8FAFC" }}>
                MANGA<span style={{ color: "#A78BFA" }}>FINN</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md font-mono text-xs transition-all duration-200 focus-ring hover:bg-panel"
                style={{ color: "#7A8FA6" }}
              >
                Koleksi
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t mt-8" style={{ borderColor: "#1E2D3D" }}>
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MangaFinnLogo size={20} />
              <span className="text-xs font-mono" style={{ color: "#7A8FA6" }}>MangaFinn</span>
            </div>
            <p className="text-xs font-mono" style={{ color: "#7A8FA6" }}>
              Koleksi pribadi &mdash; bukan untuk distribusi ulang.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
