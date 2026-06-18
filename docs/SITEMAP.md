# Sitemap: Bank Catatan Mahasiswa

## 1. Public (Guest)
- **Landing Page**
  - Hero Section (Search & CTA)
  - Cara Kerja
  - Kategori Populer
  - Statistik Platform
  - Testimoni
- **Daftar Catatan** (Public View with Search & Filters)
- **Detail Catatan** (Preview Limited)
- **Login**
- **Register**
- **FAQ / Pusat Bantuan**

## 2. Student Dashboard (Authenticated User)
- **Dashboard Overview** (Saldo Koin, Statistik Aktivitas)
- **Eksplorasi**
  - Daftar Catatan (Full Access)
  - Detail Catatan (Preview & Download CTA)
- **Manajemen Catatan Saya**
  - Upload Catatan (Form & Dropzone)
  - Daftar Upload Saya (Status Verifikasi)
- **Transaksi**
  - Riwayat Download
  - Top Up Koin (Pilih Paket & Pembayaran)
- **Profil & Pengaturan**
  - Edit Profil
  - Keamanan Akun

## 3. Admin Dashboard (Staff)
- **Overview Statistik** (User, Catatan, Transaksi)
- **Manajemen Konten**
  - Verifikasi Catatan (Pending Queue)
  - Kelola Kategori & Mata Kuliah
  - Moderasi Komentar
- **Manajemen Pengguna**
  - Daftar Mahasiswa
  - Laporan Pelanggaran
- **Laporan Keuangan**
  - Log Top Up Koin

---

# User Flow

## A. Alur Guest (Mencari & Daftar)
1. **Landing Page** -> Cari mata kuliah via Search Bar.
2. **Daftar Catatan** -> Filter berdasarkan Semester.
3. **Detail Catatan** -> Lihat deskripsi & preview terbatas.
4. **Action (Download)** -> Diminta Login/Register.
5. **Register** -> Isi data -> Masuk ke Dashboard Mahasiswa.

## B. Alur Mahasiswa (Berbagi & Mendapatkan Koin)
1. **Dashboard** -> Klik "Upload Catatan".
2. **Form Upload** -> Isi Judul, Matkul, Deskripsi, Upload PDF.
3. **Status** -> Catatan masuk status "Pending" (Menunggu Verifikasi Admin).
4. **Approved** -> Catatan muncul di publik -> Mendapatkan koin jika ada yang mendownload.
5. **Top Up** -> Jika koin habis, masuk ke menu Top Up -> Pilih nominal -> Bayar -> Saldo bertambah.

## C. Alur Admin (Moderasi)
1. **Dashboard Admin** -> Lihat notifikasi "Catatan Pending".
2. **Verifikasi** -> Buka detail file -> Cek kualitas/kesesuaian.
3. **Keputusan** -> Approve (Terbit) atau Reject (Berikan alasan).

---

# Information Architecture (IA)

## Hubungan Antar Halaman
- **Global Search**: Terhubung ke sistem basis data 'Catatan' yang bisa diakses dari Landing Page maupun Dashboard Mahasiswa.
- **Koin sebagai Currency**: Menghubungkan halaman 'Detail Catatan' (Pengeluaran), 'Upload' (Pendapatan), dan 'Top Up' (Penambahan Manual).
- **Metadata System**: Setiap 'Catatan' memiliki relasi ke 'User' (Uploader), 'Kategori' (Mata Kuliah), dan 'Semester'.
- **Hierarki Navigasi**:
  - **Public**: Linear (Landing -> Search -> Detail).
  - **Internal User**: Hub-and-Spoke (Dashboard sebagai pusat akses ke Upload, Riwayat, dan Profil).
  - **Admin**: Task-Oriented (Fokus pada antrian verifikasi dan manajemen data).