import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Manga } from "@/lib/supabase/types";
import PdfImportTool from "@/components/PdfImportTool";

export const revalidate = 0;

export default async function ImportPdfPage({
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

  return (
    <div>
      <Link
        href={`/admin/manga/${manga.id}`}
        className="text-xs font-mono text-muted hover:text-paper focus-ring"
      >
        ← Kembali ke {manga.title}
      </Link>
      <h1 className="font-display text-2xl tracking-wide mt-2 mb-6">
        IMPORT DARI PDF
      </h1>
      <PdfImportTool mangaId={manga.id} mangaSlug={manga.slug} />
    </div>
  );
}
