"use client";

import { useEffect, useState } from "react";
import MangaFinnLogo from "./MangaFinnLogo";

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "done">("show");

  useEffect(() => {
    // Cek apakah sudah pernah ditampilkan di sesi ini
    if (sessionStorage.getItem("mangafinn-loaded")) {
      setPhase("done");
      return;
    }

    const fadeTimer = setTimeout(() => setPhase("fade"), 2000);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("mangafinn-loaded", "1");
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{
        background: "#0F1923",
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: phase === "fade" ? "none" : "all",
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Logo + wordmark */}
      <div className="flex flex-col items-center gap-5 relative">
        {/* Logo with float animation */}
        <div style={{ animation: "float 2.5s ease-in-out infinite" }}>
          <MangaFinnLogo size={80} />
        </div>

        {/* Wordmark */}
        <div className="flex items-baseline gap-0 overflow-hidden">
          {"MANGAFINN".split("").map((char, i) => (
            <span
              key={i}
              className="font-display text-4xl tracking-widest"
              style={{
                color: i < 5 ? "#A78BFA" : "#F8FAFC",
                animation: `fade-up 0.4s ease-out both`,
                animationDelay: `${0.3 + i * 0.06}s`,
                display: "inline-block",
              }}
            >
              {char}
            </span>
          ))}
        </div>

        <p
          className="text-xs font-mono tracking-widest uppercase"
          style={{
            color: "#7A8FA6",
            animation: "fade-in 0.5s ease-out both",
            animationDelay: "1s",
          }}
        >
          Koleksi Komik Pribadi
        </p>

        {/* Loading bar */}
        <div
          className="w-48 h-[2px] rounded-full overflow-hidden"
          style={{ background: "#1E2D3D", marginTop: "8px" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #7C3AED, #FB7185, #F59E0B)",
              animation: "loading-bar 1.8s ease-in-out forwards",
              animationDelay: "0.4s",
            }}
          />
        </div>
      </div>

      {/* Decorative corner panels — manga-style */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-purple-light opacity-20" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-pink opacity-20" />
    </div>
  );
}
