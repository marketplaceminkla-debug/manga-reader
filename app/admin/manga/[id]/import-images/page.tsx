import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Manga } from "@/lib/supabase/types";
import ImageImportTool from "@/components/ImageImportTool";

export const revalidate = 0;

export default async function ImportImagesPage({
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
    .select("chapter_number")
    .eq("manga_id", manga.id);

  const existingChapters = (chapters ?? []).map((c) => Number(c.chapter_number));

  return (
    <div>
      <Link
        href={`/admin/manga/${manga.id}`}
        className="text-xs font-mono transition-colors focus-ring rounded"
        style={{ color: "#7A8FA6" }}
      >
        ← Kembali ke {manga.title}
      </Link>
      <h1 className="font-display text-2xl tracking-wide mt-2 mb-1">
        IMPORT DARI GAMBAR
      </h1>
      <p className="text-sm font-mono mb-6" style={{ color: "#7A8FA6" }}>
        Upload JPG, PNG, WEBP, GIF, AVIF, BMP — kualitas original, tanpa kompresi.
      </p>
      <ImageImportTool
        mangaId={manga.id}
        mangaSlug={manga.slug}
        existingChapters={existingChapters}
      />
    </div>
  );
}
