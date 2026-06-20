import type { MangaType } from "@/lib/supabase/types";

export type CountryCode = "jp" | "kr" | "cn";

export interface MangaTypeMeta {
  value: MangaType;
  /** Label singkat, mis. "Manga" */
  label: string;
  /** Negara asal, mis. "Jepang" */
  country: string;
  /** Kode bendera untuk komponen CountryFlag */
  code: CountryCode;
}

// Urutan ini dipakai juga untuk menu & dropdown.
export const MANGA_TYPES: MangaTypeMeta[] = [
  { value: "manga", label: "Manga", country: "Jepang", code: "jp" },
  { value: "manhwa", label: "Manhwa", country: "Korea", code: "kr" },
  { value: "manhua", label: "Manhua", country: "China", code: "cn" },
];

export function mangaTypeMeta(type?: string | null): MangaTypeMeta | null {
  if (!type) return null;
  return MANGA_TYPES.find((t) => t.value === type) ?? null;
}
