-- ============================================================
-- Manga Reader — Supabase schema
-- Jalankan ini di Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists manga (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_url text,
  description text,
  author text,
  genres text[],
  -- Tipe komik berdasarkan asal: manga (Jepang), manhwa (Korea), manhua (China)
  type text check (type in ('manga', 'manhwa', 'manhua')),
  status text not null default 'ongoing' check (status in ('ongoing', 'completed', 'hiatus')),
  created_at timestamptz not null default now()
);

create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references manga(id) on delete cascade,
  chapter_number numeric not null,
  title text,
  created_at timestamptz not null default now(),
  unique (manga_id, chapter_number)
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  page_number integer not null,
  image_url text not null,
  -- FIX BUG 4: unique constraint supaya tidak ada duplikat page_number per chapter
  unique (chapter_id, page_number)
);

create index if not exists idx_chapters_manga_id on chapters(manga_id);
create index if not exists idx_pages_chapter_id on pages(chapter_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table manga enable row level security;
alter table chapters enable row level security;
alter table pages enable row level security;

create policy "Public read manga" on manga for select using (true);
create policy "Public read chapters" on chapters for select using (true);
create policy "Public read pages" on pages for select using (true);

create policy "Admin write manga" on manga for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write chapters" on chapters for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write pages" on pages for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets (id, name, public)
values ('manga', 'manga', true)
on conflict (id) do nothing;

create policy "Public read manga storage" on storage.objects
  for select using (bucket_id = 'manga');

create policy "Admin write manga storage" on storage.objects
  for all using (bucket_id = 'manga' and auth.role() = 'authenticated')
  with check (bucket_id = 'manga' and auth.role() = 'authenticated');

-- ============================================================
-- ADMIN USER
-- Buat akun admin lewat Dashboard > Authentication > Users > Add User.
-- ============================================================
