import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Chapter, Manga } from "@/lib/supabase/types";
import MangaForm from "@/components/MangaForm";
import ChapterManager from "@/components/ChapterManager";

export const revalidate = 0;

export default async function EditMangaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: manga } = await supabase
    .from("manga")
    .select("*")
    .eq("id", params.id)
    .single<Manga>();

  if (!manga) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false })
    .returns<Chapter[]>();

  return (
    <div>
      <Link
        href="/admin"
        className="text-xs font-mono mb-4 inline-block transition-colors focus-ring rounded"
        style={{ color: "#7A8FA6" }}
      >
        ← Semua Manga
      </Link>

      <h1 className="font-display text-2xl tracking-wide mb-6">
        KELOLA: <span style={{ color: "#A78BFA" }}>{manga.title}</span>
      </h1>

      <section className="mb-10">
        <h2 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#7A8FA6" }}>
          Info Manga
        </h2>
        <MangaForm manga={manga} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: "#7A8FA6" }}>
            Chapter
          </h2>
          <div className="flex gap-2">
            {/* Import dari Gambar — tombol utama */}
            <Link
              href={`/admin/manga/${manga.id}/import-images`}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg transition-all duration-200 focus-ring hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                color: "#F8FAFC",
                boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
              }}
            >
              🖼️ Import dari Gambar
            </Link>
            {/* Import dari PDF */}
            <Link
              href={`/admin/manga/${manga.id}/import-pdf`}
              className="text-xs font-mono px-3 py-2 rounded-lg transition-all duration-200 focus-ring"
              style={{ border: "1px solid #1E2D3D", color: "#7A8FA6", background: "#151F2A" }}
            >
              📄 Import dari PDF
            </Link>
          </div>
        </div>
        <ChapterManager mangaId={manga.id} mangaSlug={manga.slug} chapters={chapters ?? []} />
      </section>
    </div>
  );
}
