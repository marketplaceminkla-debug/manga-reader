"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CountryFlag from "@/components/CountryFlag";
import { MANGA_TYPES } from "@/lib/mangaType";

export default function SideMenu({ genres }: { genres: string[] }) {
  const [open, setOpen] = useState(false);

  // Auto-hide: tutup saat tekan Escape, dan kunci scroll body saat terbuka.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Tombol garis tiga */}
      <button
        type="button"
        aria-label="Buka menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg focus-ring transition-colors hover:bg-panel"
      >
        <span className="block w-5 h-[2px] rounded-full" style={{ background: "#F8FAFC" }} />
        <span className="block w-5 h-[2px] rounded-full" style={{ background: "#F8FAFC" }} />
        <span className="block w-5 h-[2px] rounded-full" style={{ background: "#F8FAFC" }} />
      </button>

      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden={!open}
        className="fixed inset-0 z-[60] transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 left-0 z-[70] h-full w-72 max-w-[82vw] flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "#0F1923",
          borderRight: "1px solid #1E2D3D",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "8px 0 32px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-4 border-b"
          style={{ borderColor: "#1E2D3D" }}
        >
          <span className="font-display text-lg tracking-wider">MENU</span>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={close}
            className="w-8 h-8 rounded-lg flex items-center justify-center focus-ring transition-colors hover:bg-panel text-lg"
            style={{ color: "#7A8FA6" }}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <Link
            href="/"
            onClick={close}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-panel focus-ring"
            style={{ color: "#F8FAFC" }}
          >
            🏠 Beranda
          </Link>

          <p className="px-3 pt-4 pb-1 text-[10px] font-mono uppercase tracking-widest" style={{ color: "#7A8FA6" }}>
            Tipe Komik
          </p>
          {MANGA_TYPES.map((t) => (
            <Link
              key={t.value}
              href={`/?type=${t.value}`}
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-panel focus-ring"
              style={{ color: "#F8FAFC" }}
            >
              <span className="inline-flex overflow-hidden rounded-[2px] shrink-0" style={{ width: 22, height: 15 }}>
                <CountryFlag code={t.code} title={t.country} className="w-full h-full" />
              </span>
              <span>
                {t.label}
                <span className="font-mono text-xs" style={{ color: "#7A8FA6" }}> · {t.country}</span>
              </span>
            </Link>
          ))}

          {genres.length > 0 && (
            <>
              <p className="px-3 pt-4 pb-1 text-[10px] font-mono uppercase tracking-widest" style={{ color: "#7A8FA6" }}>
                Genre
              </p>
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {genres.map((g) => (
                  <Link
                    key={g}
                    href={`/?genre=${encodeURIComponent(g)}`}
                    onClick={close}
                    className="text-xs px-2.5 py-1 rounded-full font-mono transition-colors focus-ring hover:opacity-80"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      color: "#A78BFA",
                      border: "1px solid rgba(124,58,237,0.3)",
                    }}
                  >
                    {g}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
