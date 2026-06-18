# ARCHITECTURE.md

# Bank Catatan Mahasiswa Technical Architecture

## 1. Tech Stack

Project ini menggunakan stack berikut:

## Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Backend

* Next.js Server Actions
* Next.js Route Handlers
* Supabase Client
* Supabase Admin Client

## Database

* Supabase PostgreSQL

## Authentication

* Supabase Auth

## Storage

* Supabase Storage

Buckets:

* notes-files
* topup-proofs
* avatars

## Deployment

* Vercel

## Version Control

* GitHub

---

# 2. Development Goal

Tujuan implementasi adalah membuat website Bank Catatan Mahasiswa yang:

* Sesuai dengan PRODUCT.md
* Sesuai dengan DATABASE.md
* Sesuai dengan DESIGN.md
* Sesuai dengan SITEMAP.md
* Tidak menambahkan fitur di luar MVP
* Aman untuk role Guest, User, dan Admin
* Bisa dideploy gratis menggunakan Vercel dan Supabase Free Plan

---

# 3. Application Roles

## Guest

Pengunjung yang belum login.

Akses:

* Landing Page
* Daftar Catatan
* Detail Catatan
* Preview Catatan
* Login
* Register
* FAQ

## User

Mahasiswa yang sudah login.

Akses:

* Dashboard Mahasiswa
* Upload Catatan
* Daftar Upload Saya
* Riwayat Download
* Top Up Koin
* Riwayat Transaksi Koin
* Profil
* Komentar
* Download Catatan

## Admin

Pengelola sistem.

Akses:

* Dashboard Admin
* Verifikasi Catatan
* Kelola User
* Kelola Kategori
* Kelola Semester
* Kelola Mata Kuliah
* Moderasi Komentar
* Verifikasi Top Up
* Statistik

---

# 4. Suggested Folder Structure

```text
app/
  (public)/
    page.tsx
    notes/
      page.tsx
      [slug]/
        page.tsx
    faq/
      page.tsx

  (auth)/
    login/
      page.tsx
    register/
      page.tsx

  dashboard/
    page.tsx
    notes/
      page.tsx
    upload/
      page.tsx
    downloads/
      page.tsx
    coins/
      page.tsx
    topup/
      page.tsx
    profile/
      page.tsx

  admin/
    page.tsx
    notes/
      page.tsx
    users/
      page.tsx
    categories/
      page.tsx
    semesters/
      page.tsx
    courses/
      page.tsx
    comments/
      page.tsx
    topups/
      page.tsx
    statistics/
      page.tsx

  api/
    notes/
      download/
        route.ts
    upload/
      note/
        route.ts
      topup-proof/
        route.ts
      avatar/
        route.ts

components/
  layout/
    public-navbar.tsx
    dashboard-sidebar.tsx
    admin-sidebar.tsx
    mobile-nav.tsx

  notes/
    note-card.tsx
    note-filter.tsx
    note-preview.tsx
    note-metadata.tsx

  dashboard/
    stat-card.tsx
    activity-card.tsx

  admin/
    admin-stat-card.tsx
    verification-table.tsx

  forms/
    login-form.tsx
    register-form.tsx
    upload-note-form.tsx
    topup-form.tsx
    profile-form.tsx

lib/
  supabase/
    client.ts
    server.ts
    admin.ts
  auth/
    get-user.ts
    require-user.ts
    require-admin.ts
  actions/
    notes.ts
    comments.ts
    topups.ts
    profile.ts
    admin.ts
  utils/
    slug.ts
    format.ts
    coins.ts

types/
  database.ts
  note.ts
  user.ts
  topup.ts
```

---

# 5. Routing Structure

## Public Routes

```text
/
```

Landing page.

```text
/notes
```

Daftar catatan approved.

```text
/notes/[slug]
```

Detail catatan dan preview.

```text
/faq
```

Pusat bantuan.

---

## Auth Routes

```text
/login
/register
```

Untuk autentikasi user.

---

## User Routes

```text
/dashboard
```

Dashboard mahasiswa.

```text
/dashboard/upload
```

Upload catatan.

```text
/dashboard/notes
```

Daftar catatan milik user.

```text
/dashboard/downloads
```

Riwayat download.

```text
/dashboard/coins
```

Riwayat transaksi koin.

```text
/dashboard/topup
```

Top up koin.

```text
/dashboard/profile
```

Edit profil.

---

## Admin Routes

```text
/admin
```

Dashboard admin.

```text
/admin/notes
```

Verifikasi catatan.

```text
/admin/users
```

Kelola user.

```text
/admin/categories
```

Kelola kategori.

```text
/admin/semesters
```

Kelola semester.

```text
/admin/courses
```

Kelola mata kuliah.

```text
/admin/comments
```

Moderasi komentar.

```text
/admin/topups
```

Verifikasi top up.

```text
/admin/statistics
```

Statistik sistem.

---

# 6. Authentication Architecture

Gunakan Supabase Auth.

Alur:

1. User register menggunakan email dan password.
2. Supabase membuat data user di `auth.users`.
3. Sistem membuat data tambahan di tabel `profiles`.
4. Default role adalah `user`.
5. Admin role hanya boleh ditentukan langsung dari database/Supabase dashboard, bukan dari halaman register.

---

# 7. Authorization Rules

## Guest

Jika belum login:

* Bisa akses halaman public.
* Tidak bisa akses dashboard.
* Tidak bisa download.
* Tidak bisa komentar.
* Tidak bisa upload.

## User

Jika login sebagai user:

* Bisa akses dashboard user.
* Tidak bisa akses `/admin`.
* Bisa upload catatan.
* Bisa komentar.
* Bisa top up.
* Bisa download jika koin cukup.

## Admin

Jika login sebagai admin:

* Bisa akses `/admin`.
* Bisa mengelola data.
* Bisa verifikasi catatan.
* Bisa verifikasi top up.
* Bisa menyembunyikan komentar.

---

# 8. Middleware Rules

Gunakan middleware untuk:

* Mengecek session login
* Melindungi route dashboard
* Melindungi route admin

Rules:

```text
/dashboard/* requires authenticated user
/admin/* requires admin role
```

Jika user belum login:

```text
redirect /login
```

Jika user bukan admin tetapi akses admin:

```text
redirect /dashboard
```

---

# 9. Core Business Logic

## Upload Note

Flow:

1. User login.
2. User mengisi form upload.
3. Sistem upload file PDF ke bucket `notes-files`.
4. Sistem menyimpan data ke tabel `notes`.
5. Status default adalah `pending`.
6. Catatan belum tampil di publik.

Validation:

* File harus PDF.
* Max file 20 MB.
* Judul wajib.
* Mata kuliah wajib.
* Semester wajib.
* Kategori wajib.
* Deskripsi wajib.

---

## Approve Note

Flow:

1. Admin membuka daftar catatan pending.
2. Admin melihat detail catatan.
3. Admin klik approve.
4. Status catatan menjadi `approved`.
5. `approved_by` diisi dengan id admin.
6. `approved_at` diisi dengan timestamp.
7. User pemilik catatan mendapat reward +5 koin.
8. Sistem membuat record di `coin_transactions`.

Important:

Gunakan database transaction.

---

## Reject Note

Flow:

1. Admin membuka catatan pending.
2. Admin klik reject.
3. Admin wajib mengisi alasan penolakan.
4. Status menjadi `rejected`.
5. `rejection_reason` terisi.

---

## Download Note

Flow:

1. User login.
2. User klik download.
3. Sistem cek apakah user sudah pernah download catatan tersebut.
4. Jika sudah pernah download, user bisa download ulang tanpa membayar.
5. Jika belum pernah, sistem cek saldo koin.
6. Jika saldo kurang, tampilkan pesan saldo tidak cukup.
7. Jika saldo cukup, kurangi saldo.
8. Simpan data ke `note_downloads`.
9. Simpan transaksi ke `coin_transactions`.
10. Tambah `download_count`.
11. Berikan link download file.

Important:

Gunakan database transaction.

---

## Top Up

Flow:

1. User login.
2. User memilih nominal top up.
3. User upload bukti pembayaran.
4. Sistem membuat record `topups` dengan status `pending`.
5. Admin memeriksa top up.
6. Jika valid, admin approve.
7. Saldo koin user bertambah.
8. Sistem membuat record `coin_transactions`.

Important:

Gunakan database transaction.

---

## Comment

Flow:

1. User login.
2. User membuka detail catatan approved.
3. User menulis komentar.
4. Komentar tampil jika status `visible`.
5. Admin dapat mengubah status komentar menjadi `hidden`.

---

# 10. Server Actions

Gunakan server actions untuk:

```text
createNote()
approveNote()
rejectNote()
downloadNote()
createTopup()
approveTopup()
rejectTopup()
createComment()
hideComment()
updateProfile()
```

Jangan biarkan client mengubah data sensitif langsung.

Data sensitif:

* role
* coin_balance
* note status
* topup status
* approved_by
* verified_by

---

# 11. API Routes

Gunakan route handlers untuk operasi file dan download.

## Upload Note File

```text
POST /api/upload/note
```

Digunakan untuk upload file PDF ke Supabase Storage.

## Upload Top Up Proof

```text
POST /api/upload/topup-proof
```

Digunakan untuk upload bukti pembayaran.

## Upload Avatar

```text
POST /api/upload/avatar
```

Digunakan untuk upload foto profil.

## Download Note

```text
POST /api/notes/download
```

Digunakan untuk memproses download dengan validasi koin.

---

# 12. UI Architecture

Gunakan layout terpisah:

## Public Layout

Untuk halaman:

* Landing Page
* Daftar Catatan
* Detail Catatan
* FAQ

Komponen:

* Public Navbar
* Footer

## Dashboard Layout

Untuk halaman user.

Komponen:

* Sidebar
* Header
* Mobile Navigation
* Content Container

## Admin Layout

Untuk halaman admin.

Komponen:

* Admin Sidebar
* Admin Header
* Table Management Layout

---

# 13. Design Rules

Ikuti DESIGN.md.

Rules penting:

* Gunakan warna primary #2563EB.
* Gunakan background #F9FAFB.
* Gunakan font Inter.
* Gunakan card-based layout.
* Gunakan border radius 12px.
* Gunakan soft shadow.
* Jangan gunakan gradient berlebihan.
* Jangan gunakan animasi berat.
* Jangan gunakan glassmorphism.
* Jangan gunakan neumorphism.
* Layout harus responsive.

---

# 14. Security Rules

* Jangan expose Supabase Service Role Key di frontend.
* Service Role Key hanya boleh digunakan di server.
* Jangan percaya data role dari frontend.
* Semua route admin harus mengecek role dari database.
* Jangan izinkan user mengubah saldo koin secara langsung.
* Jangan izinkan user mengubah status catatan secara langsung.
* Jangan izinkan user mengubah status top up secara langsung.
* Validasi ukuran file dan tipe file.
* Gunakan RLS Supabase.
* File bukti top up tidak boleh public.
* File avatar boleh public.
* File catatan sebaiknya diakses melalui validasi aplikasi.

---

# 15. Environment Variables

Gunakan environment variables berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

Rules:

* `NEXT_PUBLIC_SUPABASE_URL` boleh terbaca di client.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` boleh terbaca di client.
* `SUPABASE_SERVICE_ROLE_KEY` tidak boleh terbaca di client.
* Jangan commit `.env.local`.

---

# 16. Deployment Rules

Deploy ke Vercel.

Checklist:

* Environment variables sudah diisi.
* Supabase database sudah dibuat.
* Supabase storage buckets sudah dibuat.
* RLS policy sudah aktif.
* Admin user sudah dibuat.
* Build command: `npm run build`
* Start command: default Vercel
* Framework preset: Next.js

---

# 17. Implementation Phases

## Phase 1: Project Setup

* Setup Next.js
* Setup TypeScript
* Setup Tailwind CSS
* Setup shadcn/ui
* Setup Supabase client
* Setup base layout

## Phase 2: Auth

* Register
* Login
* Logout
* Create profile after register
* Middleware protection

## Phase 3: Public Pages

* Landing Page
* Daftar Catatan
* Detail Catatan
* Search and filter

## Phase 4: User Dashboard

* Dashboard overview
* Upload catatan
* Daftar upload saya
* Riwayat download
* Riwayat koin
* Top up
* Profile

## Phase 5: Admin Dashboard

* Admin overview
* Verifikasi catatan
* Kelola user
* Kelola kategori
* Kelola semester
* Kelola mata kuliah
* Moderasi komentar
* Verifikasi top up

## Phase 6: Core Logic

* Approve catatan + reward koin
* Download catatan pakai koin
* Top up verification
* Coin transaction audit

## Phase 7: Polish

* Responsive UI
* Empty states
* Loading states
* Error messages
* Final testing

---

# 18. Do Not Implement

Jangan implementasikan fitur berikut pada MVP:

* Bookmark
* Rating
* Chat
* Follow user
* Report system
* Notification realtime
* Payment gateway otomatis
* Mobile app
* AI summary

---
