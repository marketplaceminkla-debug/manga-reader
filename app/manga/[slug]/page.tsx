import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Chapter, Manga } from "@/lib/supabase/types";

export const revalidate = 0;

export default async function MangaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: manga } = await supabase
    .from("manga")
    .select("*")
    .eq("slug", params.slug)
    .single<Manga>();

  if (!manga) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false })
    .returns<Chapter[]>();

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
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono mb-6 transition-colors focus-ring rounded"
        style={{ color: "#7A8FA6" }}
      >
        ← Kembali ke Koleksi
      </Link>

      {/* Manga header */}
      <div
        className="flex flex-col sm:flex-row gap-6 mb-10 rounded-2xl p-6 animate-fade-up relative overflow-hidden"
        style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
      >
        {/* Background glow from cover color */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)" }}
        />

        <div
          className="relative w-36 sm:w-44 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: "3/4", background: "#1E2D3D", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        >
          {manga.cover_url ? (
            <Image
              src={manga.cover_url}
              alt={manga.title}
              fill
              className="object-cover"
              sizes="180px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono" style={{ color: "#7A8FA6" }}>
              No cover
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <span className={`${badgeClass(manga.status)} text-[9px] px-2 py-0.5 mb-3 inline-block`}>
            {badgeLabel(manga.status)}
          </span>

          <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-2 animate-fade-up delay-100">
            {manga.title}
          </h1>

          {manga.author && (
            <p className="text-sm mb-3 animate-fade-up delay-200" style={{ color: "#7A8FA6" }}>
              Oleh <span style={{ color: "#A78BFA" }}>{manga.author}</span>
            </p>
          )}

          {manga.genres && manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 animate-fade-up delay-300">
              {manga.genres.map((g) => (
                <span
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full font-mono"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {manga.description && (
            <p
              className="text-sm leading-relaxed max-w-2xl animate-fade-up delay-400"
              style={{ color: "#7A8FA6" }}
            >
              {manga.description}
            </p>
          )}

          {chapters && chapters.length > 0 && (
            <div className="mt-4 animate-fade-up delay-500">
              <Link
                href={`/manga/${manga.slug}/${chapters[chapters.length - 1].chapter_number}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-bold transition-all duration-200 focus-ring hover:opacity-90 hover:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  color: "#F8FAFC",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                }}
              >
                ▶ Baca dari Awal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Chapter list */}
      <div className="animate-fade-up delay-200">
        <h2
          className="font-display text-xl tracking-wide mb-4 flex items-center gap-3"
        >
          DAFTAR CHAPTER
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}
          >
            {chapters?.length ?? 0}
          </span>
        </h2>

        {(!chapters || chapters.length === 0) && (
          <p className="text-sm font-mono" style={{ color: "#7A8FA6" }}>Belum ada chapter.</p>
        )}

        <ul className="space-y-1">
          {chapters?.map((c, i) => (
            <li key={c.id} style={{ animationDelay: `${i * 0.03}s` }}>
              <Link
                href={`/manga/${manga.slug}/${c.chapter_number}`}
                className="flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 focus-ring group hover:-translate-y-[1px]"
                style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
              >
                <span className="font-mono text-sm group-hover:text-purple-light transition-colors">
                  <span style={{ color: "#A78BFA" }}>Ch.</span>{" "}
                  <span style={{ color: "#F8FAFC" }}>{c.chapter_number}</span>
                  {c.title ? (
                    <span style={{ color: "#7A8FA6" }}> — {c.title}</span>
                  ) : null}
                </span>
                <span className="text-xs font-mono" style={{ color: "#7A8FA6" }}>
                  {new Date(c.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
