import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Manga } from "@/lib/supabase/types";
import DeleteMangaButton from "@/components/DeleteMangaButton";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: manga } = await supabase
    .from("manga")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Manga[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl tracking-wide">DAFTAR MANGA</h1>
        <Link
          href="/admin/manga/new"
          className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all duration-200 focus-ring hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            color: "#F8FAFC",
            boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
          }}
        >
          + Tambah Manga
        </Link>
      </div>

      {(!manga || manga.length === 0) && (
        <p className="text-sm font-mono" style={{ color: "#7A8FA6" }}>Belum ada manga.</p>
      )}

      <ul className="space-y-2">
        {manga?.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:border-purple/40"
            style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
          >
            <div className="relative w-10 h-14 rounded-md overflow-hidden flex-shrink-0" style={{ background: "#1E2D3D" }}>
              {m.cover_url && (
                <Image src={m.cover_url} alt={m.title} fill className="object-cover" sizes="40px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{m.title}</p>
              <p className="text-xs font-mono truncate" style={{ color: "#7A8FA6" }}>/{m.slug}</p>
            </div>
            <Link
              href={`/admin/manga/${m.id}`}
              className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all duration-200 focus-ring hover:bg-purple/10 whitespace-nowrap"
              style={{ border: "1px solid #1E2D3D", color: "#A78BFA" }}
            >
              Kelola
            </Link>
            <DeleteMangaButton id={m.id} title={m.title} />
          </li>
        ))}
      </ul>
    </div>
  );
}
