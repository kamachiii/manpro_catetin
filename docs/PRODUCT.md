# PRODUCT.md

# Bank Catatan Mahasiswa

## 1. Product Overview

Bank Catatan Mahasiswa adalah platform berbagi catatan kuliah berbasis web yang memungkinkan mahasiswa mengunggah, mencari, melihat preview, dan mengunduh catatan akademik.

Platform menggunakan sistem koin sebagai mekanisme akses catatan. Pengguna harus memiliki koin untuk mengunduh catatan.

Tujuan utama platform adalah membantu mahasiswa mendapatkan sumber belajar yang berkualitas sekaligus mendorong budaya berbagi catatan akademik.

---

# 2. Target Users

## Mahasiswa

Mahasiswa sebagai pengguna utama sistem.

Kebutuhan:

* Mencari catatan kuliah
* Mengunggah catatan
* Mengunduh catatan
* Mengelola profil
* Melakukan top up koin

---

## Admin

Administrator sistem.

Kebutuhan:

* Memverifikasi catatan
* Mengelola user
* Mengelola kategori
* Mengelola semester
* Memoderasi komentar
* Memverifikasi top up
* Melihat statistik platform

---

# 3. Roles

## Guest

Belum login.

Hak akses:

* Melihat landing page
* Mencari catatan
* Melihat daftar catatan
* Melihat detail catatan
* Melihat preview catatan
* Registrasi
* Login

Tidak dapat:

* Download catatan
* Upload catatan
* Komentar
* Top up

---

## User

Sudah login sebagai mahasiswa.

Hak akses:

* Melihat seluruh fitur guest
* Upload catatan
* Download catatan
* Komentar
* Top up koin
* Edit profil
* Melihat riwayat download
* Melihat riwayat transaksi koin

---

## Admin

Hak akses penuh.

Dapat:

* Verifikasi catatan
* Menolak catatan
* Kelola user
* Kelola kategori
* Kelola semester
* Moderasi komentar
* Verifikasi top up
* Melihat statistik

---

# 4. Business Rules

## BR-001

User harus login untuk mengunduh catatan.

---

## BR-002

User harus memiliki saldo koin yang cukup sebelum mengunduh catatan.

---

## BR-003

Setiap catatan memiliki harga download dalam bentuk koin.

Default:

3 Koin

---

## BR-004

Catatan yang baru diunggah memiliki status:

Pending

---

## BR-005

Hanya catatan dengan status Approved yang tampil pada halaman publik.

---

## BR-006

Catatan dengan status Rejected tidak dapat diakses oleh pengguna lain.

---

## BR-007

Setiap catatan yang disetujui admin memberikan reward:

+5 Koin

kepada pemilik catatan.

---

## BR-008

Top up koin harus diverifikasi admin sebelum saldo bertambah.

---

## BR-009

Guest hanya dapat melihat preview catatan.

Tidak dapat mengunduh file.

---

## BR-010

Komentar hanya dapat dibuat oleh user yang sudah login.

---

## BR-011

Admin dapat menyembunyikan komentar yang tidak sesuai.

---

## BR-012

User hanya dapat mengedit catatan miliknya sendiri.

---

## BR-013

User tidak dapat mengubah catatan yang sudah disetujui admin.

Untuk melakukan perubahan harus mengunggah revisi baru.

---

# 5. Note Status

## Pending

Menunggu verifikasi admin.

---

## Approved

Catatan diterbitkan dan dapat diunduh.

---

## Rejected

Catatan ditolak.

Admin wajib memberikan alasan penolakan.

---

# 6. Top Up Status

## Pending

Menunggu verifikasi admin.

---

## Success

Top up berhasil.

Saldo bertambah.

---

## Rejected

Top up ditolak.

Saldo tidak berubah.

---

# 7. Coin System

## Mendapatkan Koin

* Top Up Koin
* Catatan disetujui admin (+5)

---

## Menggunakan Koin

* Download Catatan

---

# 8. Upload Rules

Format yang diperbolehkan:

* PDF

Versi MVP hanya menerima PDF.

Ukuran maksimal:

20 MB

---

# 9. Search & Filter

User dapat mencari berdasarkan:

* Judul Catatan
* Mata Kuliah
* Kategori
* Semester

---

# 10. MVP Scope

Fitur yang termasuk MVP:

* Login
* Register
* Upload Catatan
* Verifikasi Catatan
* Download dengan Koin
* Top Up Manual
* Komentar
* Dashboard Mahasiswa
* Dashboard Admin
* Statistik Sederhana

---

# 11. Out of Scope

Fitur berikut tidak termasuk MVP:

* Rating Catatan
* Bookmark
* Follow User
* Chat Antar User
* Notifikasi Realtime
* Payment Gateway Otomatis
* Mobile App
* AI Summary Catatan

---

# 12. Success Metrics

Platform dianggap berjalan baik jika:

* User dapat mengunggah catatan
* Admin dapat memverifikasi catatan
* User dapat mengunduh catatan menggunakan koin
* Sistem top up berjalan
* Catatan dapat dicari dengan mudah
* Dashboard admin menampilkan statistik dasar

---
