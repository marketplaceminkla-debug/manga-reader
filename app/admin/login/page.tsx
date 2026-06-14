"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MangaFinnLogo from "@/components/MangaFinnLogo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0F1923" }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
      />

      <div
        className="w-full max-w-sm rounded-2xl p-8 relative animate-fade-up"
        style={{ background: "#151F2A", border: "1px solid #1E2D3D", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        <div className="flex flex-col items-center mb-8">
          <MangaFinnLogo size={52} className="mb-4" />
          <h1 className="font-display text-2xl tracking-wider">
            MANGA<span style={{ color: "#A78BFA" }}>FINN</span>
          </h1>
          <p className="text-xs font-mono mt-1" style={{ color: "#7A8FA6" }}>Panel Admin</p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 font-mono focus-ring"
            style={{
              background: "#0F1923",
              border: "1px solid #1E2D3D",
              color: "#F8FAFC",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 font-mono focus-ring"
            style={{
              background: "#0F1923",
              border: "1px solid #1E2D3D",
              color: "#F8FAFC",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && (
            <p className="text-xs font-mono text-center py-2 px-3 rounded-lg" style={{ background: "rgba(251,113,133,0.1)", color: "#FB7185" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-mono font-bold uppercase transition-all duration-200 focus-ring hover:opacity-90 hover:scale-[0.99] active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "#F8FAFC",
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            }}
          >
            {loading ? "Masuk..." : "Masuk →"}
          </button>
        </div>
      </div>
    </div>
  );
}
