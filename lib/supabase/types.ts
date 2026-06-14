export type MangaStatus = "ongoing" | "completed" | "hiatus";

export interface Manga {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  description: string | null;
  author: string | null;
  genres: string[] | null;
  status: MangaStatus;
  created_at: string;
}

export interface Chapter {
  id: string;
  manga_id: string;
  chapter_number: number;
  title: string | null;
  created_at: string;
}

export interface Page {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
}
