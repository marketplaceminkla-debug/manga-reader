"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Manga, MangaStatus, MangaType } from "@/lib/supabase/types";
import { MANGA_TYPES, mangaTypeMeta } from "@/lib/mangaType";
import CountryFlag from "@/components/CountryFlag";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function MangaForm({ manga }: { manga?: Manga }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(manga?.title ?? "");
  const [slug, setSlug] = useState(manga?.slug ?? "");
  const [author, setAuthor] = useState(manga?.author ?? "");
  const [description, setDescription] = useState(manga?.description ?? "");
  const [status, setStatus] = useState<MangaStatus>(manga?.status ?? "ongoing");
  const [type, setType] = useState<MangaType | "">(manga?.type ?? "");
  const [genres, setGenres] = useState((manga?.genres ?? []).join(", "));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState(manga?.cover_url ?? "");
  const [slugTouched, setSlugTouched] = useState(!!manga);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // FIX BUG 7: validasi slug sebelum submit — tidak boleh ada karakter aneh
    const cleanSlug = slugify(slug);
    if (!cleanSlug) {
      setError("Slug tidak valid. Gunakan huruf, angka, dan tanda hubung saja.");
      setSaving(false);
      return;
    }
    if (cleanSlug !== slug) {
      setError(`Slug mengandung karakter tidak valid. Saran: "${cleanSlug}"`);
      setSaving(false);
      return;
    }

    let finalCoverUrl = coverUrl;

    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `covers/${slug}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("manga")
        .upload(path, coverFile, { upsert: true });

      if (uploadError) {
        setError("Gagal upload cover: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("manga")
        .getPublicUrl(path);
      finalCoverUrl = publicUrl.publicUrl;
    }

    const genresArray = genres
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      author: author || null,
      description: description || null,
      status,
      type: type || null,
      genres: genresArray.length > 0 ? genresArray : null,
      cover_url: finalCoverUrl || null,
    };

    let resultError;
    if (manga) {
      const { error } = await supabase
        .from("manga")
        .update(payload)
        .eq("id", manga.id);
      resultError = error;
    } else {
      const { error } = await supabase.from("manga").insert(payload);
      resultError = error;
    }

    setSaving(false);

    if (resultError) {
      setError("Gagal menyimpan: " + resultError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <label className="block text-xs font-mono text-muted mb-1">Judul</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-panel border border-line px-4 py-3 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          Slug (untuk URL)
        </label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="w-full bg-panel border border-line px-4 py-3 text-sm font-mono focus-ring"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          Penulis / Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full bg-panel border border-line px-4 py-3 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          Genre (pisahkan dengan koma)
        </label>
        <input
          type="text"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          placeholder="Action, Drama, Fantasy"
          className="w-full bg-panel border border-line px-4 py-3 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          Kategori (asal komik)
        </label>
        <div className="flex items-center gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MangaType | "")}
            className="flex-1 bg-panel border border-line px-4 py-3 text-sm focus-ring"
          >
            <option value="">— Belum ditentukan —</option>
            {MANGA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.country})
              </option>
            ))}
          </select>
          {mangaTypeMeta(type) && (
            <span
              className="inline-flex overflow-hidden rounded-[3px] shrink-0"
              style={{ width: 32, height: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
            >
              <CountryFlag
                code={mangaTypeMeta(type)!.code}
                title={mangaTypeMeta(type)!.country}
                className="w-full h-full"
              />
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono mt-1" style={{ color: "#7A8FA6" }}>
          Manga = Jepang 🇯🇵, Manhwa = Korea 🇰🇷, Manhua = China 🇨🇳
        </p>
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MangaStatus)}
          className="w-full bg-panel border border-line px-4 py-3 text-sm focus-ring"
        >
          <option value="ongoing">Ongoing</option>
          <option value="completed">Tamat</option>
          <option value="hiatus">Hiatus</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-panel border border-line px-4 py-3 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          Cover {coverUrl && "(akan diganti jika upload baru)"}
        </label>
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Cover saat ini"
            className="w-24 h-32 object-cover mb-2 border border-line"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="w-full bg-panel border border-line px-4 py-3 text-sm focus-ring"
        />
      </div>

      {error && <p className="text-stamp text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-stamp text-paper px-5 py-3 text-sm font-mono font-bold uppercase focus-ring disabled:opacity-50 self-start"
      >
        {saving ? "Menyimpan..." : manga ? "Simpan Perubahan" : "Tambah Manga"}
      </button>
    </form>
  );
}
