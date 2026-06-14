import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Chapter, Manga, Page } from "@/lib/supabase/types";
import PagesManager from "@/components/PagesManager";

export const revalidate = 0;

export default async function ChapterPagesPage({
  params,
}: {
  params: { id: string; chapterId: string };
}) {
  const supabase = createClient();

  const { data: manga } = await supabase
    .from("manga")
    .select("*")
    .eq("id", params.id)
    .single<Manga>();

  if (!manga) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", params.chapterId)
    .single<Chapter>();

  if (!chapter) notFound();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("chapter_id", chapter.id)
    .order("page_number", { ascending: true })
    .returns<Page[]>();

  return (
    <div>
      <Link
        href={`/admin/manga/${manga.id}`}
        className="text-xs font-mono text-muted hover:text-paper focus-ring"
      >
        ← Kembali ke {manga.title}
      </Link>
      <h1 className="font-display text-2xl tracking-wide mt-2 mb-6">
        HALAMAN — CHAPTER {chapter.chapter_number}
        {chapter.title ? ` (${chapter.title})` : ""}
      </h1>

      <PagesManager
        mangaSlug={manga.slug}
        chapterId={chapter.id}
        chapterNumber={chapter.chapter_number}
        pages={pages ?? []}
      />
    </div>
  );
}
