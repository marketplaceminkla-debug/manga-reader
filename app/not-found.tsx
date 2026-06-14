import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="text-8xl font-display mb-4 animate-fade-up"
        style={{ color: "#1E2D3D" }}
      >
        404
      </div>
      <div
        className="w-16 h-1 rounded-full mb-6 animate-fade-up delay-100"
        style={{ background: "linear-gradient(90deg, #7C3AED, #FB7185)" }}
      />
      <p className="font-display text-xl tracking-wide mb-2 animate-fade-up delay-200">
        HALAMAN TIDAK DITEMUKAN
      </p>
      <p className="text-sm font-mono mb-8 animate-fade-up delay-300" style={{ color: "#7A8FA6" }}>
        Chapter ini sepertinya belum tersedia.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all duration-200 focus-ring hover:opacity-90 animate-fade-up delay-400"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
          color: "#F8FAFC",
        }}
      >
        ← Kembali ke Koleksi
      </Link>
    </div>
  );
}
