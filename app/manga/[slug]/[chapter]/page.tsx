import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Chapter, Manga, Page } from "@/lib/supabase/types";

export const revalidate = 0;

export default async function ReaderPage({
  params,
}: {
  params: { slug: string; chapter: string };
}) {
  const supabase = createClient();
  const chapterNumber = Number(params.chapter);

  const { data: manga } = await supabase
    .from("manga")
    .select("*")
    .eq("slug", params.slug)
    .single<Manga>();

  if (!manga) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .eq("chapter_number", chapterNumber)
    .single<Chapter>();

  if (!chapter) notFound();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("chapter_id", chapter.id)
    .order("page_number", { ascending: true })
    .returns<Page[]>();

  const { data: allChapters } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: true })
    .returns<{ chapter_number: number }[]>();

  const numbers = allChapters?.map((c) => c.chapter_number) ?? [];
  const idx = numbers.indexOf(chapterNumber);
  const prev = idx > 0 ? numbers[idx - 1] : null;
  const next = idx >= 0 && idx < numbers.length - 1 ? numbers[idx + 1] : null;

  const navBar = (
    <div className="flex items-center justify-between gap-2 py-4 px-2">
      {prev !== null ? (
        <Link
          href={`/manga/${manga.slug}/${prev}`}
          className="text-xs font-mono px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring hover:opacity-90 hover:-translate-x-0.5"
          style={{ background: "#151F2A", border: "1px solid #1E2D3D", color: "#A78BFA" }}
        >
          ← Ch. {prev}
        </Link>
      ) : <span />}

      <Link
        href={`/manga/${manga.slug}`}
        className="text-xs font-mono px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
        style={{ background: "#151F2A", border: "1px solid #1E2D3D", color: "#7A8FA6" }}
      >
        Daftar Chapter
      </Link>

      {next !== null ? (
        <Link
          href={`/manga/${manga.slug}/${next}`}
          className="text-xs font-mono px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring hover:opacity-90 hover:translate-x-0.5"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#F8FAFC", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}
        >
          Ch. {next} →
        </Link>
      ) : <span />}
    </div>
  );

  return (
    <div className="py-4" style={{ background: "#0F1923" }}>
      {/* Header — narrow container */}
      <div className="max-w-2xl mx-auto px-3 mb-3">
        <div
          className="px-4 py-3 rounded-xl animate-fade-up"
          style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
        >
          <Link
            href={`/manga/${manga.slug}`}
            className="text-xs font-mono uppercase tracking-widest transition-colors focus-ring rounded"
            style={{ color: "#7A8FA6" }}
          >
            {manga.title}
          </Link>
          <h1 className="font-display text-xl tracking-wide mt-0.5">
            <span style={{ color: "#A78BFA" }}>Chapter {chapter.chapter_number}</span>
            {chapter.title ? <span style={{ color: "#F8FAFC" }}> — {chapter.title}</span> : ""}
          </h1>
        </div>

        {/* Top nav */}
        <div
          className="rounded-xl mt-2 animate-fade-up delay-100"
          style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
        >
          {navBar}
        </div>
      </div>

      {(!pages || pages.length === 0) && (
        <p className="text-sm text-center py-12 font-mono" style={{ color: "#7A8FA6" }}>
          Belum ada halaman untuk chapter ini.
        </p>
      )}

      {/* Pages — full width, no gap, natural height */}
      <div className="flex flex-col" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {pages?.map((p) => (
          <div key={p.id} className="w-full" style={{ lineHeight: 0 }}>
            <Image
              src={p.image_url}
              alt={`Halaman ${p.page_number}`}
              width={1200}
              height={1800}
              className="w-full h-auto block"
              style={{ display: "block" }}
              sizes="(max-width: 800px) 100vw, 800px"
              priority={p.page_number <= 2}
            />
          </div>
        ))}
      </div>

      {/* Bottom nav — narrow container */}
      <div className="max-w-2xl mx-auto px-3 mt-3">
        <div
          className="rounded-xl"
          style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
        >
          {navBar}
        </div>
      </div>
    </div>
  );
}
