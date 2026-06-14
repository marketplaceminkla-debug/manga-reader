import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MangaFinnLogo from "@/components/MangaFinnLogo";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#0F1923" }}>
      <div
        className="border-b mb-6"
        style={{ borderColor: "#1E2D3D", background: "#151F2A" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MangaFinnLogo size={28} />
            <span className="font-display text-lg tracking-wider" style={{ color: "#F8FAFC" }}>
              MANGA<span style={{ color: "#A78BFA" }}>FINN</span>
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full ml-1"
              style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono transition-colors focus-ring rounded"
              style={{ color: "#7A8FA6" }}
            >
              ← Lihat Situs
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-12">{children}</div>
    </div>
  );
}
