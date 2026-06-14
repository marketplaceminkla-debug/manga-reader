import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Manga } from "@/lib/supabase/types";
import SearchBar from "@/components/SearchBar";

export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q?.trim() ?? "";

  let query = supabase
    .from("manga")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: manga, error } = await query;

  const badgeLabel = (status: string) => {
    if (status === "completed") return "TAMAT";
    if (status === "hiatus") return "HIATUS";
    return "ONGOING";
  };

  const badgeClass = (status: string) => {
    if (status === "completed") return "hanko tamat";
    if (status === "hiatus") return "hanko hiatus";
    return "hanko";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero search section */}
      <section
        className="mb-10 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #151F2A 0%, #1a1535 100%)", border: "1px solid #1E2D3D" }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(251,113,133,0.1) 0%, transparent 70%)" }}
        />

        <p
          className="text-xs font-mono uppercase tracking-widest mb-2 animate-fade-up"
          style={{ color: "#7A8FA6" }}
        >
          Koleksi Pribadi
        </p>
        <h1
          className="font-display text-3xl sm:text-4xl tracking-wide mb-6 animate-fade-up delay-100"
        >
          Temukan <span className="gradient-text">komik favoritmu</span>
        </h1>

        <div className="animate-fade-up delay-200">
          <SearchBar defaultValue={q} />
        </div>
      </section>

      {error && (
        <p className="text-sm mb-4" style={{ color: "#FB7185" }}>
          Gagal memuat data: {error.message}
        </p>
      )}

      {manga && manga.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-sm font-mono" style={{ color: "#7A8FA6" }}>
            {q
              ? `Tidak ada judul yang cocok dengan "${q}".`
              : "Belum ada manga. Tambahkan lewat panel admin."}
          </p>
        </div>
      )}

      {manga && manga.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: "#7A8FA6" }}
            >
              {q ? `Hasil pencarian "${q}"` : "Semua Koleksi"} — {manga.length} judul
            </h2>
          </div>

          <div className="panel-grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {manga.map((m: Manga, i: number) => (
              <Link
                key={m.id}
                href={`/manga/${m.slug}`}
                className="group focus-ring card-glow p-2 block"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden mb-2 rounded-lg"
                  style={{ background: "#1E2D3D" }}
                >
                  {m.cover_url ? (
                    <Image
                      src={m.cover_url}
                      alt={m.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono" style={{ color: "#7A8FA6" }}>
                      No cover
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(124,58,237,0.4) 0%, transparent 50%)" }}
                  />

                  <span className={`${badgeClass(m.status)} absolute top-2 left-2 text-[9px] px-2 py-0.5`}>
                    {badgeLabel(m.status)}
                  </span>
                </div>

                <h2
                  className="text-xs font-semibold leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-purple-light"
                  style={{ color: "#F8FAFC" }}
                >
                  {m.title}
                </h2>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
