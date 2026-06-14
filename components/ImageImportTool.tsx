"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif", "image/bmp", "image/tiff"];
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp,.gif,.avif,.bmp,.tiff,.tif";

interface Props {
  mangaId: string;
  mangaSlug: string;
  existingChapters: number[];
}

export default function ImageImportTool({ mangaId, mangaSlug, existingChapters }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [chapterNumber, setChapterNumber] = useState<string>(
    existingChapters.length > 0 ? String(Math.max(...existingChapters) + 1) : "1"
  );
  const [chapterTitle, setChapterTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => ACCEPTED.includes(f.type) || f.name.match(/\.(jpe?g|png|webp|gif|avif|bmp|tiff?)$/i));
    const sorted = valid.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      const merged = [...prev, ...sorted.filter(f => !names.has(f.name))];
      return merged.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    });
    setError(null);
    setDone(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function moveFile(idx: number, dir: "up" | "down") {
    setFiles(prev => {
      const arr = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  }

  async function handleUpload() {
    setError(null);
    if (!chapterNumber.trim() || isNaN(Number(chapterNumber))) {
      setError("Nomor chapter harus diisi dan berupa angka."); return;
    }
    if (existingChapters.includes(Number(chapterNumber))) {
      setError(`Chapter ${chapterNumber} sudah ada. Pakai nomor lain.`); return;
    }
    if (files.length === 0) {
      setError("Pilih minimal 1 gambar dulu."); return;
    }

    setUploading(true);
    setProgress({ done: 0, total: files.length });

    try {
      // Buat chapter dulu
      const { data: chapterRow, error: chapterErr } = await supabase
        .from("chapters")
        .insert({
          manga_id: mangaId,
          chapter_number: Number(chapterNumber),
          title: chapterTitle.trim() || null,
        })
        .select()
        .single();

      if (chapterErr || !chapterRow) throw new Error("Gagal membuat chapter: " + chapterErr?.message);

      // Upload semua gambar
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const pageNum = i + 1;
        const path = `${mangaSlug}/${chapterNumber}/${String(pageNum).padStart(4, "0")}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("manga")
          .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadErr) throw new Error(`Gagal upload ${file.name}: ${uploadErr.message}`);

        const { data: urlData } = supabase.storage.from("manga").getPublicUrl(path);

        const { error: pageErr } = await supabase.from("pages").insert({
          chapter_id: chapterRow.id,
          page_number: pageNum,
          image_url: urlData.publicUrl,
        });

        if (pageErr) throw new Error(`Gagal simpan halaman ${pageNum}: ${pageErr.message}`);

        setProgress({ done: i + 1, total: files.length });
      }

      setDone(true);
      setFiles([]);
      setChapterTitle("");
      setChapterNumber(String(Number(chapterNumber) + 1));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Chapter info */}
      <div
        className="rounded-xl p-4 flex flex-col sm:flex-row gap-3"
        style={{ background: "#151F2A", border: "1px solid #1E2D3D" }}
      >
        <div className="flex flex-col gap-1 flex-shrink-0">
          <label className="text-xs font-mono uppercase tracking-widest" style={{ color: "#7A8FA6" }}>
            No. Chapter *
          </label>
          <input
            type="number"
            value={chapterNumber}
            onChange={e => setChapterNumber(e.target.value)}
            disabled={uploading}
            className="w-28 px-3 py-2 text-sm rounded-lg outline-none font-mono focus-ring"
            style={{ background: "#0F1923", border: "1px solid #1E2D3D", color: "#F8FAFC" }}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-mono uppercase tracking-widest" style={{ color: "#7A8FA6" }}>
            Judul Chapter (opsional)
          </label>
          <input
            type="text"
            value={chapterTitle}
            onChange={e => setChapterTitle(e.target.value)}
            disabled={uploading}
            placeholder="cth: The Beginning"
            className="px-3 py-2 text-sm rounded-lg outline-none focus-ring"
            style={{ background: "#0F1923", border: "1px solid #1E2D3D", color: "#F8FAFC" }}
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 select-none"
        style={{
          border: `2px dashed ${dragging ? "#7C3AED" : "#1E2D3D"}`,
          background: dragging ? "rgba(124,58,237,0.06)" : "#151F2A",
          padding: "2.5rem 1.5rem",
          transform: dragging ? "scale(1.01)" : "scale(1)",
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200"
          style={{ background: dragging ? "rgba(124,58,237,0.2)" : "#1E2D3D" }}
        >
          🖼️
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
            {dragging ? "Lepas di sini!" : "Drag & drop gambar, atau klik untuk pilih"}
          </p>
          <p className="text-xs font-mono mt-1" style={{ color: "#7A8FA6" }}>
            JPG · PNG · WEBP · GIF · AVIF · BMP — bisa pilih banyak sekaligus
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          multiple
          className="hidden"
          onChange={e => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* File list preview */}
      {files.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #1E2D3D" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: "#151F2A", borderBottom: "1px solid #1E2D3D" }}
          >
            <span className="text-xs font-mono" style={{ color: "#7A8FA6" }}>
              {files.length} gambar dipilih — urutan = nomor halaman
            </span>
            <button
              onClick={() => setFiles([])}
              disabled={uploading}
              className="text-xs font-mono transition-colors"
              style={{ color: "#7A8FA6" }}
            >
              Hapus semua
            </button>
          </div>

          <div
            className="overflow-y-auto"
            style={{ maxHeight: "320px", background: "#0F1923" }}
          >
            {files.map((f, i) => (
              <div
                key={f.name + i}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{ borderBottom: "1px solid #1E2D3D" }}
              >
                {/* Thumbnail */}
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="w-10 h-12 object-cover rounded flex-shrink-0"
                  style={{ background: "#1E2D3D" }}
                />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate" style={{ color: "#F8FAFC" }}>
                    <span style={{ color: "#A78BFA" }}>Hal. {i + 1}</span> — {f.name}
                  </p>
                  <p className="text-[10px] font-mono" style={{ color: "#7A8FA6" }}>
                    {(f.size / 1024).toFixed(0)} KB · {f.type.split("/")[1].toUpperCase()}
                  </p>
                </div>
                {/* Controls */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveFile(i, "up")}
                    disabled={i === 0 || uploading}
                    className="w-7 h-7 rounded text-xs flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: "#1E2D3D", color: "#F8FAFC" }}
                  >↑</button>
                  <button
                    onClick={() => moveFile(i, "down")}
                    disabled={i === files.length - 1 || uploading}
                    className="w-7 h-7 rounded text-xs flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: "#1E2D3D", color: "#F8FAFC" }}
                  >↓</button>
                  <button
                    onClick={() => removeFile(i)}
                    disabled={uploading}
                    className="w-7 h-7 rounded text-xs flex items-center justify-center transition-all"
                    style={{ background: "rgba(251,113,133,0.1)", color: "#FB7185" }}
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-mono"
          style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.3)", color: "#FB7185" }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {done && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-mono"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399" }}
        >
          ✓ Chapter berhasil diupload! Siap tambah chapter berikutnya.
        </div>
      )}

      {/* Upload button + progress */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-mono font-bold uppercase transition-all duration-200 focus-ring hover:opacity-90 disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            color: "#F8FAFC",
            boxShadow: uploading ? "none" : "0 4px 14px rgba(124,58,237,0.3)",
          }}
        >
          {uploading ? `Upload ${progress.done}/${progress.total}...` : `Upload ${files.length > 0 ? files.length + " gambar" : ""}`}
        </button>

        {uploading && (
          <div className="flex-1 max-w-xs">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2D3D" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #7C3AED, #FB7185)",
                }}
              />
            </div>
            <p className="text-[10px] font-mono mt-1" style={{ color: "#7A8FA6" }}>{pct}%</p>
          </div>
        )}
      </div>

      <p className="text-xs font-mono" style={{ color: "#7A8FA6" }}>
        Gambar akan diupload dengan kualitas original — tidak ada kompresi.
      </p>
    </div>
  );
}
