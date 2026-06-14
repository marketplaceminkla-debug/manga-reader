"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Range = {
  start: number;
  end: number;
  chapterNumber: string;
  title: string;
};

export default function PdfImportTool({
  mangaId,
  mangaSlug,
}: {
  mangaId: string;
  mangaSlug: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [existingChapters, setExistingChapters] = useState<number[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chapters")
        .select("chapter_number")
        .eq("manga_id", mangaId);
      const nums = (data ?? []).map((c) => Number(c.chapter_number));
      setExistingChapters(nums);
    })();
  }, [mangaId, supabase]);

  async function handleFileChange(f: File | null) {
    setFile(f);
    setError(null);
    setNumPages(null);
    setRanges([]);
    if (!f) return;

    setLoadingPdf(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdf.numPages);

      // Mulai dengan 1 baris kosong, user isi manual
      const nextChapter = existingChapters.length > 0
        ? Math.max(...existingChapters) + 1
        : 1;
      setRanges([{ start: 1, end: pdf.numPages, chapterNumber: String(nextChapter), title: "" }]);
    } catch (e) {
      setError("Gagal membaca PDF: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoadingPdf(false);
    }
  }

  function updateRange(index: number, field: keyof Range, value: string) {
    setRanges((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addRange() {
    setRanges((prev) => {
      const last = prev[prev.length - 1];
      const start = last ? last.end + 1 : 1;
      const end = numPages ?? start;
      const chapterNumber = last ? String(Number(last.chapterNumber) + 1) : "1";
      return [...prev, { start, end, chapterNumber, title: "" }];
    });
  }

  function removeRange(index: number) {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  }

  function appendLog(line: string) {
    setLog((prev) => [...prev, line]);
  }

  async function handleProcess() {
    if (!file || !numPages || ranges.length === 0) return;
    setError(null);
    setLog([]);

    // Validasi
    const numbers = ranges.map((r) => r.chapterNumber.trim());
    const dupes = numbers.filter((n, i) => numbers.indexOf(n) !== i);
    if (dupes.length > 0) {
      setError("Ada nomor chapter yang ganda: " + dupes.join(", "));
      return;
    }
    const conflicts = numbers.filter((n) => existingChapters.includes(Number(n)));
    if (conflicts.length > 0) {
      setError("Nomor chapter berikut sudah ada, ubah dulu: " + conflicts.join(", "));
      return;
    }
    for (const r of ranges) {
      if (!r.chapterNumber.trim() || isNaN(Number(r.chapterNumber))) {
        setError("Nomor chapter tidak boleh kosong / harus angka.");
        return;
      }
      const start = Number(r.start);
      const end = Number(r.end);
      if (start < 1 || end > numPages || start > end) {
        setError(
          `Chapter ${r.chapterNumber}: range halaman ${start}–${end} tidak valid. PDF hanya punya ${numPages} halaman.`
        );
        return;
      }
    }

    setProcessing(true);
    const totalPages = ranges.reduce((sum, r) => sum + (Number(r.end) - Number(r.start) + 1), 0);
    setProgress({ done: 0, total: totalPages });

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let doneCount = 0;

      for (const range of ranges) {
        const chapterNumber = Number(range.chapterNumber);
        const startPage = Number(range.start);
        const endPage = Number(range.end);

        appendLog(`Membuat Chapter ${chapterNumber} (hal. ${startPage}–${endPage})...`);

        const { data: chapterRow, error: chapterError } = await supabase
          .from("chapters")
          .insert({
            manga_id: mangaId,
            chapter_number: chapterNumber,
            title: range.title.trim() || null,
          })
          .select()
          .single();

        if (chapterError || !chapterRow) {
          throw new Error(`Gagal membuat Chapter ${chapterNumber}: ${chapterError?.message}`);
        }

        let pageNumber = 1;
        for (let p = startPage; p <= endPage; p++) {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas tidak didukung di browser ini.");

          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.85)
          );

          // Cleanup canvas segera setelah blob dibuat
          canvas.width = 0;
          canvas.height = 0;

          if (!blob) throw new Error(`Gagal merender halaman ${p}.`);

          const path = `${mangaSlug}/${chapterNumber}/${String(pageNumber).padStart(4, "0")}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("manga")
            .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

          if (uploadError) {
            throw new Error(`Gagal upload hal. ${p} (Ch.${chapterNumber}): ${uploadError.message}`);
          }

          const { data: publicUrl } = supabase.storage.from("manga").getPublicUrl(path);

          const { error: pageError } = await supabase.from("pages").insert({
            chapter_id: chapterRow.id,
            page_number: pageNumber,
            image_url: publicUrl.publicUrl,
          });

          if (pageError) {
            throw new Error(`Gagal simpan hal. ${pageNumber} Ch.${chapterNumber}: ${pageError.message}`);
          }

          pageNumber++;
          doneCount++;
          setProgress({ done: doneCount, total: totalPages });
          await new Promise((r) => setTimeout(r, 0));
        }

        appendLog(`✓ Chapter ${chapterNumber} selesai (${endPage - startPage + 1} halaman).`);
      }

      appendLog("Selesai semua! Mengarahkan ulang...");
      setTimeout(() => {
        router.push(`/admin/manga/${mangaId}`);
        router.refresh();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Upload PDF */}
      <div className="border border-line bg-panel p-4">
        <label className="block text-xs font-mono text-muted mb-2">
          Pilih file PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          disabled={loadingPdf || processing}
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className="w-full bg-ink border border-line px-3 py-2 text-sm focus-ring"
        />
        {loadingPdf && (
          <p className="text-xs font-mono text-muted mt-2">Membaca PDF...</p>
        )}
        {numPages !== null && (
          <p className="text-xs font-mono text-muted mt-2">
            ✓ Terdeteksi <strong>{numPages} halaman</strong>.
          </p>
        )}
      </div>

      {/* Tabel chapter manual */}
      {numPages !== null && (
        <div className="border border-line bg-panel p-4">
          <p className="text-xs font-mono text-muted mb-1">
            Isi manual: halaman berapa sampai berapa untuk setiap chapter.
          </p>
          {existingChapters.length > 0 && (
            <p className="text-xs text-muted mb-3">
              Chapter yang sudah ada:{" "}
              {existingChapters.sort((a, b) => a - b).join(", ")}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono text-muted border-b border-line">
                  <th className="py-2 pr-3">No. Chapter</th>
                  <th className="py-2 pr-3">Dari hal.</th>
                  <th className="py-2 pr-3">Sampai hal.</th>
                  <th className="py-2 pr-3">Judul (opsional)</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {ranges.map((r, i) => (
                  <tr key={i} className="border-b border-line">
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={r.chapterNumber}
                        disabled={processing}
                        onChange={(e) => updateRange(i, "chapterNumber", e.target.value)}
                        className="w-20 bg-ink border border-line px-2 py-1 text-xs font-mono focus-ring"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={1}
                        max={numPages}
                        value={r.start}
                        disabled={processing}
                        onChange={(e) => updateRange(i, "start", e.target.value)}
                        className="w-20 bg-ink border border-line px-2 py-1 text-xs font-mono focus-ring"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={1}
                        max={numPages}
                        value={r.end}
                        disabled={processing}
                        onChange={(e) => updateRange(i, "end", e.target.value)}
                        className="w-20 bg-ink border border-line px-2 py-1 text-xs font-mono focus-ring"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={r.title}
                        disabled={processing}
                        onChange={(e) => updateRange(i, "title", e.target.value)}
                        className="w-full bg-ink border border-line px-2 py-1 text-xs focus-ring"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeRange(i)}
                        disabled={processing}
                        className="text-xs font-mono border border-line px-2 py-1 hover:bg-stamp hover:border-stamp focus-ring"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addRange}
            disabled={processing}
            className="text-xs font-mono border border-line px-3 py-2 mt-3 hover:bg-ink focus-ring"
          >
            + Tambah Chapter
          </button>
        </div>
      )}

      {error && (
        <div className="border border-stamp bg-panel p-3">
          <p className="text-stamp text-sm font-mono">{error}</p>
        </div>
      )}

      {numPages !== null && (
        <button
          onClick={handleProcess}
          disabled={processing || ranges.length === 0}
          className="bg-stamp text-paper px-5 py-3 text-sm font-mono font-bold uppercase focus-ring disabled:opacity-50 self-start"
        >
          {processing
            ? `Memproses ${progress.done}/${progress.total} halaman...`
            : "Mulai Proses"}
        </button>
      )}

      {log.length > 0 && (
        <div className="border border-line bg-panel p-4 text-xs font-mono text-muted flex flex-col gap-1 max-h-48 overflow-y-auto">
          {log.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">
        Catatan: proses berjalan di browser. Jangan tutup tab sampai selesai.
      </p>
    </div>
  );
}
