# DATABASE.md

# Bank Catatan Mahasiswa Database Design

## 1. Database Overview

Database digunakan untuk menyimpan data pengguna, catatan, kategori, semester, mata kuliah, komentar, top up koin, transaksi koin, dan riwayat download.

Platform menggunakan sistem role:

* Guest
* User
* Admin

Guest tidak disimpan sebagai data role karena guest adalah pengunjung yang belum login.

Database direkomendasikan menggunakan:

* PostgreSQL jika menggunakan Supabase
* MySQL jika menggunakan Laravel

Untuk workflow full AI zero cost, gunakan:

Supabase PostgreSQL

---

# 2. Tables

## 2.1 profiles

Tabel ini menyimpan data profil user yang terhubung dengan Supabase Auth.

Supabase Auth menyimpan data login di tabel `auth.users`, sedangkan data tambahan user disimpan di tabel `profiles`.

### Columns

```sql
id uuid primary key references auth.users(id) on delete cascade
name varchar(100) not null
role varchar(20) not null default 'user'
coin_balance integer not null default 0
nim varchar(30)
major varchar(100)
semester_id bigint references semesters(id) on delete set null
avatar_url text
is_active boolean not null default true
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Role Values

```text
user
admin
```

---

## 2.2 semesters

Tabel ini menyimpan data semester.

### Columns

```sql
id bigserial primary key
name varchar(50) not null
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Example Data

```text
Semester 1
Semester 2
Semester 3
Semester 4
Semester 5
Semester 6
Semester 7
Semester 8
```

---

## 2.3 categories

Tabel ini menyimpan kategori catatan.

### Columns

```sql
id bigserial primary key
name varchar(100) not null
slug varchar(120) not null unique
description text
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Example Data

```text
Pemrograman
Basis Data
Manajemen Proyek
Jaringan Komputer
Matematika
Bahasa Indonesia
```

---

## 2.4 courses

Tabel ini menyimpan data mata kuliah.

### Columns

```sql
id bigserial primary key
category_id bigint references categories(id) on delete set null
semester_id bigint references semesters(id) on delete set null
name varchar(120) not null
slug varchar(140) not null unique
code varchar(30)
description text
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Example Data

```text
Manajemen Proyek
Basis Data
Pemrograman Web
Dasar-Dasar Pemrograman
Matematika Diskrit
Jaringan Komputer
```

---

## 2.5 notes

Tabel utama untuk menyimpan data catatan yang diunggah user.

### Columns

```sql
id bigserial primary key
user_id uuid not null references profiles(id) on delete cascade
category_id bigint references categories(id) on delete set null
course_id bigint references courses(id) on delete set null
semester_id bigint references semesters(id) on delete set null
title varchar(180) not null
slug varchar(220) not null unique
description text
file_path text not null
file_original_name varchar(255)
file_type varchar(50)
file_size bigint
coin_price integer not null default 3
status varchar(20) not null default 'pending'
rejection_reason text
download_count integer not null default 0
view_count integer not null default 0
approved_by uuid references profiles(id) on delete set null
approved_at timestamp with time zone
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Status Values

```text
pending
approved
rejected
```

### Rules

* Catatan baru selalu memiliki status `pending`.
* Catatan hanya muncul di halaman publik jika status `approved`.
* Jika status `rejected`, `rejection_reason` wajib diisi.
* Default harga download adalah 3 koin.
* File catatan hanya menerima PDF untuk MVP.

---

## 2.6 note_downloads

Tabel ini menyimpan riwayat download catatan.

### Columns

```sql
id bigserial primary key
user_id uuid not null references profiles(id) on delete cascade
note_id bigint not null references notes(id) on delete cascade
coin_spent integer not null
downloaded_at timestamp with time zone default now()
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Suggested Constraint

```sql
unique(user_id, note_id)
```

### Rules

* User hanya membayar satu kali untuk satu catatan.
* Jika user sudah pernah download catatan yang sama, user bisa download ulang tanpa mengurangi koin lagi.
* Download count bertambah saat download pertama kali.

---

## 2.7 coin_transactions

Tabel ini menyimpan seluruh riwayat perubahan saldo koin.

### Columns

```sql
id bigserial primary key
user_id uuid not null references profiles(id) on delete cascade
type varchar(30) not null
amount integer not null
balance_before integer not null
balance_after integer not null
description text
reference_type varchar(50)
reference_id bigint
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Type Values

```text
topup
download
upload_reward
admin_adjustment
```

### Rules

* Nilai `amount` positif jika saldo bertambah.
* Nilai `amount` negatif jika saldo berkurang.
* Setiap perubahan saldo wajib masuk ke tabel ini.
* `balance_before` dan `balance_after` wajib disimpan untuk audit.

---

## 2.8 topups

Tabel ini menyimpan pengajuan top up koin.

### Columns

```sql
id bigserial primary key
user_id uuid not null references profiles(id) on delete cascade
amount integer not null
coin_amount integer not null
payment_method varchar(30) not null
proof_image text
status varchar(20) not null default 'pending'
admin_note text
verified_by uuid references profiles(id) on delete set null
verified_at timestamp with time zone
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Payment Method Values

```text
transfer_bank
qris
ewallet
```

### Status Values

```text
pending
success
rejected
```

### Rules

* User membuat pengajuan top up.
* User mengunggah bukti pembayaran.
* Admin memverifikasi pengajuan.
* Jika `success`, saldo user bertambah sesuai `coin_amount`.
* Jika `rejected`, saldo tidak berubah.

---

## 2.9 comments

Tabel ini menyimpan komentar pada catatan.

### Columns

```sql
id bigserial primary key
user_id uuid not null references profiles(id) on delete cascade
note_id bigint not null references notes(id) on delete cascade
content text not null
status varchar(20) not null default 'visible'
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
```

### Status Values

```text
visible
hidden
```

### Rules

* Hanya user login yang dapat membuat komentar.
* Admin dapat menyembunyikan komentar.
* Komentar hidden tidak ditampilkan pada halaman detail catatan.

---

# 3. Relationships

## profiles

* profiles has many notes
* profiles has many comments
* profiles has many topups
* profiles has many note_downloads
* profiles has many coin_transactions

## semesters

* semesters has many profiles
* semesters has many courses
* semesters has many notes

## categories

* categories has many courses
* categories has many notes

## courses

* courses belongs to categories
* courses belongs to semesters
* courses has many notes

## notes

* notes belongs to profiles
* notes belongs to categories
* notes belongs to courses
* notes belongs to semesters
* notes has many comments
* notes has many note_downloads

## topups

* topups belongs to profiles
* topups verified_by profiles

## comments

* comments belongs to profiles
* comments belongs to notes

---

# 4. Entity Relationship Summary

```text
auth.users
    |
    | one to one
    v
profiles
    |
    | one to many
    v
notes

profiles
    |
    | one to many
    v
topups

profiles
    |
    | one to many
    v
coin_transactions

profiles
    |
    | one to many
    v
note_downloads

notes
    |
    | one to many
    v
comments

notes
    |
    | one to many
    v
note_downloads

categories
    |
    | one to many
    v
courses

categories
    |
    | one to many
    v
notes

semesters
    |
    | one to many
    v
courses

semesters
    |
    | one to many
    v
notes
```

---

# 5. Storage Buckets

Gunakan Supabase Storage.

## notes-files

Untuk menyimpan file PDF catatan.

Path pattern:

```text
notes/{user_id}/{timestamp}-{filename}.pdf
```

Access:

* Upload: user login
* Read: user login atau public preview jika dibutuhkan
* Download: melalui validasi aplikasi

---

## topup-proofs

Untuk menyimpan bukti pembayaran top up.

Path pattern:

```text
topups/{user_id}/{timestamp}-{filename}
```

Access:

* Upload: user login
* Read: admin dan pemilik file

---

## avatars

Untuk menyimpan foto profil user.

Path pattern:

```text
avatars/{user_id}/{filename}
```

Access:

* Upload: pemilik akun
* Read: public

---

# 6. Recommended Indexes

```sql
create index idx_notes_status on notes(status);
create index idx_notes_user_id on notes(user_id);
create index idx_notes_category_id on notes(category_id);
create index idx_notes_course_id on notes(course_id);
create index idx_notes_semester_id on notes(semester_id);
create index idx_notes_title on notes(title);
create index idx_comments_note_id on comments(note_id);
create index idx_topups_status on topups(status);
create index idx_coin_transactions_user_id on coin_transactions(user_id);
create index idx_note_downloads_user_id on note_downloads(user_id);
create index idx_note_downloads_note_id on note_downloads(note_id);
```

---

# 7. Row Level Security Rules

Jika menggunakan Supabase, aktifkan Row Level Security pada semua tabel utama.

## profiles

* User dapat melihat profilnya sendiri.
* User dapat mengedit profilnya sendiri.
* Admin dapat melihat semua profil.
* Admin dapat mengubah role dan status user.

## notes

* Public hanya dapat melihat catatan dengan status approved.
* User dapat melihat catatan miliknya sendiri.
* User dapat membuat catatan baru.
* User dapat mengedit catatan miliknya jika status masih pending.
* Admin dapat melihat dan mengubah semua catatan.

## note_downloads

* User hanya dapat melihat riwayat download miliknya.
* Admin dapat melihat semua data download.

## coin_transactions

* User hanya dapat melihat transaksi koin miliknya.
* Admin dapat melihat semua transaksi.

## topups

* User dapat membuat top up miliknya.
* User hanya dapat melihat top up miliknya.
* Admin dapat melihat dan mengubah semua top up.

## comments

* Public dapat melihat komentar dengan status visible.
* User login dapat membuat komentar.
* Admin dapat menyembunyikan komentar.

---

# 8. Seed Data

## semesters

```text
Semester 1
Semester 2
Semester 3
Semester 4
Semester 5
Semester 6
Semester 7
Semester 8
```

## categories

```text
Pemrograman
Basis Data
Manajemen Proyek
Jaringan Komputer
Matematika
Bahasa Indonesia
Sistem Operasi
Keamanan Jaringan
```

## courses

```text
Dasar-Dasar Pemrograman
Basis Data
Manajemen Proyek
Pemrograman Web
Matematika Diskrit
Jaringan Komputer
Sistem Operasi
Bahasa Indonesia
```

---

# 9. Important Implementation Notes

* Jangan menyimpan file PDF langsung di database.
* Simpan file di Supabase Storage.
* Database hanya menyimpan path file.
* Semua perubahan saldo koin harus dicatat pada `coin_transactions`.
* Gunakan transaksi database saat proses download agar saldo dan riwayat download tetap konsisten.
* Gunakan transaksi database saat admin approve top up.
* Gunakan transaksi database saat admin approve catatan dan memberi reward koin.
* Jangan biarkan client langsung mengubah `coin_balance`.
* Perubahan saldo hanya boleh dilakukan melalui server action/API route.
* Role admin tidak boleh ditentukan dari frontend.
* Catatan pending dan rejected tidak boleh tampil di halaman publik.

---
