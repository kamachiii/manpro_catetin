# TASKS.md

# Bank Catatan Mahasiswa Development Tasks

## Project Goal

Membangun MVP Bank Catatan Mahasiswa sesuai:

* DESIGN.md
* SITEMAP.md
* PRODUCT.md
* DATABASE.md
* ARCHITECTURE.md

Tidak boleh menambahkan fitur di luar dokumentasi.

---

# PHASE 1 - Project Initialization

## Objective

Mempersiapkan pondasi project.

### Tasks

* Create Next.js project
* Setup TypeScript
* Setup Tailwind CSS
* Setup shadcn/ui
* Setup ESLint
* Setup Prettier
* Setup Git repository
* Setup environment variables
* Configure project structure

### Acceptance Criteria

* Project dapat dijalankan secara lokal
* Tidak ada build error
* Folder structure sesuai ARCHITECTURE.md

---

# PHASE 2 - Supabase Setup

## Objective

Membangun backend foundation.

### Tasks

* Create Supabase project
* Configure Auth
* Create Storage Buckets
* Create PostgreSQL schema
* Create tables from DATABASE.md
* Create indexes
* Configure Row Level Security
* Create initial admin account

### Acceptance Criteria

* Semua tabel berhasil dibuat
* Storage bucket tersedia
* RLS aktif
* Admin account dapat login

---

# PHASE 3 - Authentication

## Objective

Membangun sistem login.

### Tasks

* Register page
* Login page
* Logout
* Session management
* Auto create profile after register
* Middleware protection

### Acceptance Criteria

* User dapat register
* User dapat login
* User dapat logout
* User profile otomatis dibuat
* Route protection berjalan

---

# PHASE 4 - Public Website

## Objective

Membangun halaman publik.

### Tasks

* Landing page
* Navbar
* Footer
* FAQ page
* Notes listing page
* Search notes
* Filter by category
* Filter by semester
* Note detail page
* Note preview page

### Acceptance Criteria

* Guest dapat melihat catatan approved
* Search berfungsi
* Filter berfungsi
* Preview berfungsi
* UI responsive

---

# PHASE 5 - Student Dashboard

## Objective

Membangun dashboard mahasiswa.

### Tasks

* Dashboard overview
* Sidebar navigation
* Statistics cards
* Profile page
* Edit profile page

### Acceptance Criteria

* Dashboard dapat diakses user
* Data user tampil
* Profile dapat diperbarui

---

# PHASE 6 - Upload Notes

## Objective

Implementasi upload catatan.

### Tasks

* Upload form
* PDF validation
* Upload to Storage
* Save metadata
* Notes management page
* Note status page

### Acceptance Criteria

* User dapat upload PDF
* Catatan masuk status pending
* File tersimpan di storage
* Metadata tersimpan di database

---

# PHASE 7 - Admin Note Verification

## Objective

Implementasi verifikasi catatan.

### Tasks

* Pending notes page
* Approve note action
* Reject note action
* Rejection reason modal
* Note detail review page

### Acceptance Criteria

* Admin dapat melihat catatan pending
* Admin dapat approve
* Admin dapat reject
* Alasan reject tersimpan

---

# PHASE 8 - Coin System

## Objective

Implementasi sistem koin.

### Tasks

* Coin balance display
* Coin transaction history
* Upload reward logic
* Coin audit trail

### Acceptance Criteria

* Coin balance tampil
* Reward +5 coin saat approve
* Riwayat transaksi tersimpan

---

# PHASE 9 - Download Notes

## Objective

Implementasi download menggunakan koin.

### Tasks

* Download validation
* Coin deduction
* Download history
* Download tracking
* Duplicate download handling

### Acceptance Criteria

* User harus login
* Coin harus cukup
* Coin berkurang saat download
* Download history tersimpan
* Download ulang tidak memotong coin

---

# PHASE 10 - Top Up Coin

## Objective

Implementasi top up manual.

### Tasks

* Top up page
* Upload proof
* Pending status
* Admin verification
* Approve top up
* Reject top up

### Acceptance Criteria

* User dapat mengajukan top up
* Bukti pembayaran tersimpan
* Admin dapat approve
* Coin bertambah saat approve

---

# PHASE 11 - Comments

## Objective

Implementasi komentar.

### Tasks

* Create comment
* Display comment
* Hide comment
* Delete comment

### Acceptance Criteria

* User login dapat komentar
* Admin dapat hide komentar
* Komentar hidden tidak tampil

---

# PHASE 12 - Admin Management

## Objective

Membangun panel administrasi.

### Tasks

* User management
* Category management
* Semester management
* Course management

### Acceptance Criteria

* CRUD berjalan
* Data konsisten
* Validation berjalan

---

# PHASE 13 - Statistics

## Objective

Dashboard statistik admin.

### Tasks

* Total users
* Total notes
* Total downloads
* Total topups
* Pending notes count
* Simple charts

### Acceptance Criteria

* Statistik tampil realtime
* Data sesuai database

---

# PHASE 14 - UI Polish

## Objective

Penyempurnaan tampilan.

### Tasks

* Loading states
* Empty states
* Error states
* Skeleton loading
* Responsive testing

### Acceptance Criteria

* Mobile responsive
* Desktop responsive
* Tidak ada broken UI

---

# PHASE 15 - Security Audit

## Objective

Memastikan aplikasi aman.

### Tasks

* Verify RLS
* Verify role protection
* Verify file access
* Verify admin access
* Verify coin manipulation protection

### Acceptance Criteria

* User tidak dapat akses admin
* Coin tidak dapat dimanipulasi
* File private aman

---

# PHASE 16 - Deployment

## Objective

Publish aplikasi.

### Tasks

* Configure Vercel
* Configure environment variables
* Production build
* Production testing

### Acceptance Criteria

* Website online
* Build sukses
* Login berjalan
* Upload berjalan
* Download berjalan
* Admin panel berjalan

---

# MVP Definition

Project dianggap selesai jika:

* Login/Register berjalan
* Upload catatan berjalan
* Admin dapat memverifikasi catatan
* User dapat download menggunakan koin
* Top up berjalan
* Komentar berjalan
* Dashboard admin berjalan
* Dashboard mahasiswa berjalan
* Website berhasil deploy

---

# Non-MVP Features

Jangan implementasikan:

* Bookmark
* Rating
* Follow User
* Chat
* Notification Realtime
* AI Summary
* Payment Gateway Otomatis
* Mobile App
* Report System
* Gamification
