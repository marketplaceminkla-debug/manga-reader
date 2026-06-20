import CountryFlag from "@/components/CountryFlag";
import { mangaTypeMeta } from "@/lib/mangaType";

/**
 * Menampilkan bendera negara + keterangan tipe komik (Manga/Manhwa/Manhua).
 * - variant "chip": pill lengkap dengan teks (untuk halaman detail / list admin)
 * - variant "flag": hanya bendera kecil (untuk pojok cover di grid)
 */
export default function MangaTypeBadge({
  type,
  variant = "chip",
  className = "",
}: {
  type?: string | null;
  variant?: "chip" | "flag";
  className?: string;
}) {
  const meta = mangaTypeMeta(type);
  if (!meta) return null;

  if (variant === "flag") {
    return (
      <span
        className={`inline-flex items-center justify-center overflow-hidden rounded-[3px] shadow ${className}`}
        title={`${meta.label} — ${meta.country}`}
        style={{ width: 22, height: 15, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
      >
        <CountryFlag code={meta.code} title={meta.country} className="w-full h-full" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono text-xs px-2.5 py-1 ${className}`}
      style={{
        background: "rgba(124,58,237,0.12)",
        color: "#A78BFA",
        border: "1px solid rgba(124,58,237,0.3)",
      }}
      title={`${meta.label} — ${meta.country}`}
    >
      <span
        className="inline-flex overflow-hidden rounded-[2px] shrink-0"
        style={{ width: 18, height: 12 }}
      >
        <CountryFlag code={meta.code} title={meta.country} className="w-full h-full" />
      </span>
      <span>
        {meta.label}
        <span style={{ color: "#7A8FA6" }}> · {meta.country}</span>
      </span>
    </span>
  );
}
