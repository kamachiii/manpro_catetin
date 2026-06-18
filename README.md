# Bank Catatan Mahasiswa (BCM) - Web Platform

Bank Catatan Mahasiswa adalah platform berbagi catatan kuliah berbasis koin yang memungkinkan mahasiswa mengunggah, mencari, melihat pratinjau (preview), dan mengunduh catatan akademik secara terstruktur dan aman.

## Tech Stack
- **Core**: Next.js (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS & shadcn/ui
- **Database & Auth**: Supabase PostgreSQL & Auth (cookie-based session integration)
- **Storage**: Supabase Storage Buckets
- **Icons**: Lucide Icons

---

## Fitur Utama

### 1. Portal Publik (Guest / User)
- **Landing Page**: Dilengkapi dengan pencarian catatan global, alur kerja, kategori populer, dan data statistik platform.
- **Katalog Catatan**: Cari dan filter catatan akademik berdasarkan Kategori, Semester, atau Mata Kuliah.
- **Detail Catatan**: Deskripsi materi, metadata lengkap, pratinjau (PDF preview) dengan filter blur untuk melindungi hak cipta sebelum koin dibayarkan, serta daftar komentar.

### 2. Dashboard Mahasiswa (Student Workspace)
- **Overview**: Saldo koin, ringkasan jumlah unggahan & unduhan catatan, serta riwayat perubahan saldo.
- **Profil Akademis**: Manajemen data NIM, Jurusan, Semester saat ini, dan unggah foto profil (avatar).
- **Unggah Catatan**: Formulir unggah dengan dropzone validasi file PDF (max 20MB) yang dikirim ke bucket private secure storage.
- **Kelola Catatan**: Lacak status catatan (Pending, Approved, Rejected beserta alasan penolakan dari admin).

### 3. Panel Administrasi (Admin Panel)
- **Dashboard Ringkasan**: Statistik agregat pengguna, berkas, volume unduhan, dan antrean verifikasi.
- **Verifikasi Catatan**: Review dokumen via PDF preview iframe, serta setujui (uploader diberi +5 koin) atau tolak catatan (wajib menyertakan alasan penolakan).
- **Persetujuan Top Up**: Antrean verifikasi pembayaran manual, tampilan struk via modal secure, dan persetujuan pengajuan top up.
- **Kelola Pengguna**: Cari pengguna berdasarkan nama/NIM/jurusan, dan nonaktifkan atau aktifkan kembali akun mahasiswa.

---

## Arsitektur & Keamanan Ekonomi

### Pengamanan Aset Dokumen (Private Storage)
Berkas PDF catatan disimpan di bucket private `notes-files` dan struk pembayaran di bucket private `topup-proofs`. Berkas-berkas ini tidak dapat diakses secara publik.
1. Admin meninjau berkas melalui signed URL temporer yang dibuat di server-side.
2. Mahasiswa mengunduh berkas melalui API Route `/api/notes/download?noteId=id`. API ini memvalidasi kepemilikan atau kecukupan koin terlebih dahulu melalui RPC database sebelum memicu pembuatan signed URL file.

### Keamanan Saldo Koin (Database Transactions via RPC)
Pembaruan saldo koin dilarang dimutasi langsung dari client-side untuk mencegah manipulasi. RLS memblokir update langsung ke `profiles.coin_balance`. Penyesuaian saldo koin wajib melalui 3 PostgreSQL RPC Security Definer berikut:
- **`handle_note_download(p_user_id, p_note_id)`**: Memeriksa saldo koin, mengurangi saldo (default 3 koin), memasukkan riwayat unduhan, dan mencatat audit perubahan saldo pada tabel `coin_transactions`. Pembelian berulang untuk catatan yang sama dibebaskan dari biaya.
- **`handle_note_approval(p_note_id, p_admin_id)`**: Mengubah status berkas menjadi disetujui, dan memberikan reward +5 koin kepada pemilik catatan serta mencatat audit transaksi.
- **`handle_topup_approval(p_topup_id, p_admin_id)`**: Menyetujui pengajuan top up, menambahkan saldo koin pengguna sesuai nominal paket, dan mencatat audit transaksi.

---

## Database Schema (Tabel-tabel Utama)
1. **`semesters`**: Data semester akademik (Semester 1 - 8).
2. **`categories`**: Kategori catatan akademik (Pemrograman, Basis Data, dll).
3. **`courses`**: Mata kuliah spesifik terelasi ke kategori dan semester.
4. **`profiles`**: Data tambahan user terhubung ke `auth.users`, menampung role (`user`, `admin`), saldo koin, NIM, Jurusan, dan status aktif (`is_active`).
5. **`notes`**: Berkas catatan kuliah (status: `pending`, `approved`, `rejected` dengan `rejection_reason`).
6. **`note_downloads`**: Riwayat unduhan catatan kuliah.
7. **`coin_transactions`**: Audit trail komprehensif perubahan saldo koin.
8. **`topups`**: Pengajuan manual top up koin dan struk bukti pembayaran.
9. **`comments`**: Ulasan atau diskusi pada catatan akademik.

---

## Panduan Pengaturan Lokal

1. **Salin file `.env.example` menjadi `.env.local`**:
   ```bash
   cp .env.example .env.local
   ```
2. **Isi parameter kredensial Supabase**:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL API project Supabase Anda.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key publik Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (admin) rahasia. **Jangan sampai bocor ke sisi client!**
3. **Instalasi Dependensi**:
   ```bash
   npm install
   ```
4. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
5. **Jalankan Linter & Build Tes**:
   ```bash
   npm run lint
   npm run build
   ```
