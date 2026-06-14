# MangaFinn

Website baca komik pribadi. Public hanya bisa membaca, hanya kamu (admin)
yang bisa menambah/mengedit/menghapus manga, chapter, dan halaman lewat
panel di `/admin`.

## 1. Setup Supabase

1. Buka project Supabase kamu.
2. Masuk ke **SQL Editor**, buka file `supabase/schema.sql` di project ini,
   copy semua isinya, paste ke SQL Editor, lalu **Run**.
   - Ini akan membuat tabel `manga`, `chapters`, `pages`, mengaktifkan
     Row Level Security, dan membuat bucket storage `manga` (public).
3. Masuk ke **Authentication > Users**, klik **Add user**, buat 1 akun
   dengan email & password kamu sendiri. Ini akan jadi akun admin satu-satunya.
   - **Jangan** aktifkan public sign-up. Project ini tidak punya halaman
     register, jadi tidak masalah.
4. Masuk ke **Project Settings > API**, catat:
   - `Project URL`
   - `anon public` key

## 2. Setup project lokal

```bash
cp .env.local.example .env.local
```

Isi `.env.local` dengan `Project URL` dan `anon public` key dari Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi-anon-key-disini
```

Install dependencies & jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` untuk halaman publik, dan
`http://localhost:3000/admin/login` untuk login admin.

## 3. Deploy ke Vercel

1. Push project ini ke GitHub (repo bisa private).
2. Buka [vercel.com](https://vercel.com), klik **Add New Project**, import
   repo tersebut.
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**.

Setelah deploy selesai, situs publik bisa diakses semua orang, tapi
`/admin` hanya bisa diakses kalau login dengan akun yang kamu buat di
langkah 1.3.

## 4. Cara pakai panel admin

1. Login di `/admin/login`.
2. Klik **+ Tambah Manga** — isi judul, slug (otomatis dari judul),
   penulis, genre, status, deskripsi, dan upload cover.
3. Setelah manga dibuat, klik **Kelola** pada judul tersebut.
4. Di bagian **Chapter**, isi nomor chapter (misal `1`, `1.5`, `2`) dan
   judul chapter (opsional), klik **+ Tambah Chapter**.
5. Klik **Kelola Halaman** pada chapter tersebut, lalu upload gambar
   halaman. Pilih beberapa file gambar sekaligus — urutannya akan
   mengikuti urutan nama file (jadi pastikan nama file diberi nomor,
   misal `01.jpg`, `02.jpg`, dst).
6. Halaman bisa diurutkan ulang dengan tombol ↑ ↓, atau dihapus dengan ×.

## Import dari PDF

Selain upload gambar satu-satu, ada juga fitur **Import dari PDF** di
halaman **Kelola** tiap manga. Fitur ini berguna kalau kamu punya satu
file PDF berisi banyak halaman (misal satu volume) dan ingin memecahnya
jadi beberapa chapter sekaligus:

1. Buka **Kelola** pada manga, klik **Import dari PDF**.
2. Upload file PDF — jumlah halaman akan terdeteksi otomatis.
3. Atur **"Halaman per chapter"** (misal 20) dan **"Mulai dari chapter
   no."**, lalu klik **Generate Ulang** untuk membuat tabel pembagian
   otomatis. Tabel ini bisa diedit manual (range halaman, nomor chapter,
   judul) atau ditambah/dihapus barisnya.
4. Klik **Mulai Proses**. Setiap halaman PDF akan dirender jadi gambar
   langsung di browser, lalu diupload ke storage dan dibuatkan chapter
   sesuai pembagian di tabel.

Proses ini berjalan di browser (butuh koneksi internet stabil untuk
upload), jadi untuk PDF dengan ratusan halaman bisa makan waktu beberapa
menit — jangan tutup tab sampai selesai.

> Ingat: fitur ini hanya alat bantu teknis. Tetap pastikan kamu punya
> hak/izin atas konten PDF yang diupload.

## Struktur folder penting

```
app/                     -> halaman publik (Next.js App Router)
app/admin/               -> panel admin (dilindungi middleware.ts)
components/              -> komponen form & manajer upload
lib/supabase/            -> koneksi ke Supabase (client, server, types)
supabase/schema.sql       -> skema database + RLS + storage bucket
middleware.ts            -> proteksi route /admin
```

## Catatan penting

- Pastikan semua konten yang kamu upload memang punya hak/izin untuk
  kamu distribusikan ulang.
- Limit gratis Supabase: 1GB storage & 500MB database. Kalau koleksi
  makin besar, pertimbangkan upgrade plan Supabase atau pindahkan
  storage gambar ke layanan lain (misal Cloudflare R2) dengan tetap
  pakai Supabase untuk database & auth.
