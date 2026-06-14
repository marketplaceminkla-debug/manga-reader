"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Page } from "@/lib/supabase/types";

export default function PagesManager({
  mangaSlug,
  chapterId,
  chapterNumber,
  pages,
}: {
  mangaSlug: string;
  chapterId: string;
  chapterNumber: number;
  pages: Page[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const sorted = Array.from(files).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    setProgress({ done: 0, total: sorted.length });

    let nextPageNumber =
      pages.length > 0 ? Math.max(...pages.map((p) => p.page_number)) + 1 : 1;

    for (const file of sorted) {
      const ext = file.name.split(".").pop();
      const path = `${mangaSlug}/${chapterNumber}/${String(nextPageNumber).padStart(
        4,
        "0"
      )}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("manga")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(`Gagal upload ${file.name}: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("manga")
        .getPublicUrl(path);

      const { error: insertError } = await supabase.from("pages").insert({
        chapter_id: chapterId,
        page_number: nextPageNumber,
        image_url: publicUrl.publicUrl,
      });

      if (insertError) {
        setError(`Gagal simpan halaman ${nextPageNumber}: ${insertError.message}`);
        setUploading(false);
        return;
      }

      nextPageNumber += 1;
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setUploading(false);
    router.refresh();
  }

  async function handleDeletePage(id: string) {
    if (!confirm("Hapus halaman ini?")) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus: " + error.message);
      return;
    }
    router.refresh();
  }

  async function handleMove(page: Page, direction: "up" | "down") {
    const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
    const idx = sorted.findIndex((p) => p.id === page.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];

    await supabase
      .from("pages")
      .update({ page_number: other.page_number })
      .eq("id", page.id);
    await supabase
      .from("pages")
      .update({ page_number: page.page_number })
      .eq("id", other.id);

    router.refresh();
  }

  const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);

  return (
    <div>
      <div className="border border-line bg-panel p-4 mb-6">
        <label className="block text-xs font-mono text-muted mb-2">
          Upload halaman (pilih banyak gambar sekaligus, urutan nama file
          menentukan urutan halaman)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="w-full bg-ink border border-line px-3 py-2 text-sm focus-ring"
        />
        {uploading && (
          <p className="text-xs font-mono text-muted mt-2">
            Mengunggah {progress.done}/{progress.total}...
          </p>
        )}
        {error && <p className="text-stamp text-sm mt-2">{error}</p>}
      </div>

      {sortedPages.length === 0 && (
        <p className="text-muted text-sm">Belum ada halaman.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sortedPages.map((p, i) => (
          <div key={p.id} className="border border-line bg-panel p-2">
            <img
              src={p.image_url}
              alt={`Halaman ${p.page_number}`}
              className="w-full h-40 object-cover mb-2"
            />
            <div className="flex items-center justify-between text-xs font-mono">
              <span>Hal. {p.page_number}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleMove(p, "up")}
                  disabled={i === 0}
                  className="border border-line px-2 py-1 hover:bg-ink focus-ring disabled:opacity-30"
                  aria-label="Pindah ke atas"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(p, "down")}
                  disabled={i === sortedPages.length - 1}
                  className="border border-line px-2 py-1 hover:bg-ink focus-ring disabled:opacity-30"
                  aria-label="Pindah ke bawah"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleDeletePage(p.id)}
                  className="border border-line px-2 py-1 hover:bg-stamp hover:border-stamp focus-ring"
                  aria-label="Hapus halaman"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
