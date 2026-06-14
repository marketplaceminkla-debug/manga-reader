"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Chapter } from "@/lib/supabase/types";

export default function ChapterManager({
  mangaId,
  mangaSlug,
  chapters,
}: {
  mangaId: string;
  mangaSlug: string;
  chapters: Chapter[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const nextNumber =
    chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_number)) + 1 : 1;

  const [chapterNumber, setChapterNumber] = useState(String(nextNumber));
  const [chapterTitle, setChapterTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const num = Number(chapterNumber);

    const { error } = await supabase.from("chapters").insert({
      manga_id: mangaId,
      chapter_number: num,
      title: chapterTitle || null,
    });

    setSaving(false);

    if (error) {
      setError("Gagal menambah chapter: " + error.message);
      return;
    }

    // FIX BUG 5: reset form ke nomor berikutnya setelah berhasil simpan
    setChapterTitle("");
    setChapterNumber(String(num + 1));
    router.refresh();
  }

  async function handleDeleteChapter(id: string, number: number) {
    if (!confirm(`Hapus Chapter ${number} beserta semua halamannya?`)) return;
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <form
        onSubmit={handleAddChapter}
        className="flex flex-wrap items-end gap-3 mb-6 border border-line p-4 bg-panel"
      >
        <div>
          <label className="block text-xs font-mono text-muted mb-1">
            No. Chapter
          </label>
          <input
            type="number"
            step="any"
            required
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            className="w-28 bg-ink border border-line px-3 py-2 text-sm font-mono focus-ring"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-mono text-muted mb-1">
            Judul Chapter (opsional)
          </label>
          <input
            type="text"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="w-full bg-ink border border-line px-3 py-2 text-sm focus-ring"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-stamp text-paper px-4 py-2 text-xs font-mono font-bold uppercase focus-ring disabled:opacity-50"
        >
          {saving ? "..." : "+ Tambah Chapter"}
        </button>
      </form>

      {error && <p className="text-stamp text-sm mb-4">{error}</p>}

      {chapters.length === 0 && (
        <p className="text-muted text-sm">Belum ada chapter.</p>
      )}

      <ul className="divide-y divide-line">
        {chapters.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <span className="font-mono text-sm">
              Chapter {c.chapter_number}
              {c.title ? ` — ${c.title}` : ""}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/manga/${mangaId}/chapters/${c.id}`}
                className="text-xs font-mono border border-line px-3 py-2 hover:bg-ink focus-ring"
              >
                Kelola Halaman
              </Link>
              <Link
                href={`/manga/${mangaSlug}/${c.chapter_number}`}
                target="_blank"
                className="text-xs font-mono border border-line px-3 py-2 hover:bg-ink focus-ring"
              >
                Lihat
              </Link>
              <button
                onClick={() => handleDeleteChapter(c.id, c.chapter_number)}
                className="text-xs font-mono border border-line px-3 py-2 hover:bg-stamp hover:border-stamp focus-ring"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
