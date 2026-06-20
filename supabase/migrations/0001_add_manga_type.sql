-- ============================================================
-- Migration: tambah kolom `type` ke tabel manga
-- Jalankan di Supabase Dashboard > SQL Editor untuk database
-- yang sudah ada (kalau baru setup, schema.sql sudah memuat ini).
--
-- type:
--   'manga'  -> Jepang
--   'manhwa' -> Korea
--   'manhua' -> China
-- ============================================================

alter table manga
  add column if not exists type text
  check (type in ('manga', 'manhwa', 'manhua'));
