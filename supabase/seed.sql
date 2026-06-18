-- ==========================================
-- MASTER DATA SEEDS (PRODUCTION SAFE)
-- ==========================================

-- Seed Semesters
insert into public.semesters (id, name) values
  (1, 'Semester 1'),
  (2, 'Semester 2'),
  (3, 'Semester 3'),
  (4, 'Semester 4'),
  (5, 'Semester 5'),
  (6, 'Semester 6'),
  (7, 'Semester 7'),
  (8, 'Semester 8')
on conflict (id) do nothing;

-- Seed Categories
insert into public.categories (id, name, slug, description) values
  (1, 'Pemrograman', 'pemrograman', 'Kategori catatan seputar coding, algoritma, dan pemrograman.'),
  (2, 'Basis Data', 'basis-data', 'Kategori catatan seputar SQL, perancangan database, dan optimasi query.'),
  (3, 'Manajemen Proyek', 'manajemen-proyek', 'Kategori catatan seputar metodologi manajemen proyek perangkat lunak.'),
  (4, 'Jaringan Komputer', 'jaringan-komputer', 'Kategori catatan seputar topologi jaringan, protokol, dan komunikasi data.'),
  (5, 'Matematika', 'matematika', 'Kategori catatan seputar matematika diskrit, aljabar, dan kalkulus.'),
  (6, 'Bahasa Indonesia', 'bahasa-indonesia', 'Kategori catatan tata bahasa, tata tulis karya ilmiah, dan penulisan laporan.'),
  (7, 'Sistem Operasi', 'sistem-operasi', 'Kategori catatan seputar penjadwalan CPU, memori virtual, dan proses kernel.'),
  (8, 'Keamanan Jaringan', 'keamanan-jaringan', 'Kategori catatan seputar kriptografi, firewall, pengetesan celah keamanan.')
on conflict (id) do nothing;

-- Seed Courses
insert into public.courses (id, category_id, semester_id, name, slug, code, description) values
  (1, 1, 1, 'Dasar-Dasar Pemrograman', 'dasar-dasar-pemrograman', 'IK101', 'Mata kuliah dasar algoritma dan coding dasar.'),
  (2, 2, 2, 'Basis Data', 'basis-data', 'IK102', 'Mata kuliah dasar perancangan ERD dan normalisasi.'),
  (3, 3, 5, 'Manajemen Proyek', 'manajemen-proyek', 'IK201', 'Mata kuliah manajemen proyek perangkat lunak.'),
  (4, 1, 3, 'Pemrograman Web', 'pemrograman-web', 'IK202', 'Mata kuliah pengembangan aplikasi web client-side dan server-side.'),
  (5, 5, 1, 'Matematika Diskrit', 'matematika-diskrit', 'IK103', 'Mata kuliah logika, relasi fungsi, graf, dan combinatorics.'),
  (6, 4, 4, 'Jaringan Komputer', 'jaringan-komputer', 'IK203', 'Mata kuliah routing, subnetting, dan model OSI.'),
  (7, 7, 3, 'Sistem Operasi', 'sistem-operasi', 'IK204', 'Mata kuliah manajemen memori, file system, dan threads.'),
  (8, 6, 1, 'Bahasa Indonesia', 'bahasa-indonesia', 'IK104', 'Mata kuliah tata tulis bahasa Indonesia dan penulisan ilmiah.')
on conflict (id) do nothing;


-- ==========================================================
-- LOCAL DEVELOPMENT ONLY SEED DATA (DO NOT RUN IN PRODUCTION)
-- ==========================================================

-- Seed Mock Auth Users (password is 'password123')
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values 
  ('c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mahasiswa@example.com', '$2a$10$wEeb5FfB3aP60d7zP/aD..tXJ0r9j7jL9X7DqA19L27eM6L.S6fXm', now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Budi Santoso"}', now(), now()),
  ('d683b549-bcfd-4a11-b4c6-dfbc8a2d1d3b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', '$2a$10$wEeb5FfB3aP60d7zP/aD..tXJ0r9j7jL9X7DqA19L27eM6L.S6fXm', now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Sistem"}', now(), now())
on conflict (id) do nothing;

-- Ensure trigger-created profiles have correct configurations
update public.profiles
  set role = 'admin'
  where id = 'd683b549-bcfd-4a11-b4c6-dfbc8a2d1d3b';

update public.profiles
  set coin_balance = 15,
      nim = '12345678',
      major = 'Teknik Informatika',
      semester_id = 3
  where id = 'c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a';

-- Seed Approved Notes
insert into public.notes (id, user_id, category_id, course_id, semester_id, title, slug, description, file_path, file_original_name, file_type, file_size, coin_price, status, approved_by, approved_at, created_at, updated_at)
values
  (1, 'c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a', 1, 4, 3, 'Catatan Lengkap React & Next.js App Router', 'catatan-lengkap-react-next-js-app-router', 'Catatan ini membahas fundamental React Server Components (RSC), Suspense, Server Actions, dan routing dinamis pada Next.js.', 'notes/c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a/1717584000000-nextjs-guide.pdf', 'nextjs-guide.pdf', 'application/pdf', 1024500, 3, 'approved', 'd683b549-bcfd-4a11-b4c6-dfbc8a2d1d3b', now(), now(), now()),
  (2, 'c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a', 2, 2, 2, 'Ringkasan SQL Joins dan Normalisasi ERD', 'ringkasan-sql-joins-dan-normalisasi-erd', 'Ringkasan lengkap mengenai teknik Normalisasi database (1NF, 2NF, 3NF), relasi antar tabel, dan penggunaan JOIN query.', 'notes/c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a/1717584001000-sql-joints.pdf', 'sql-joints.pdf', 'application/pdf', 512300, 2, 'approved', 'd683b549-bcfd-4a11-b4c6-dfbc8a2d1d3b', now(), now(), now()),
  (3, 'c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a', 3, 3, 5, 'Panduan Metodologi Agile & Scrum dalam Software Dev', 'panduan-metodologi-agile-scrum-dalam-software-dev', 'Catatan kuliah manajemen proyek seputar Scrum framework, Sprint planning, Kanban, dan diagram Burndown.', 'notes/c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a/1717584002000-scrum-guide.pdf', 'scrum-guide.pdf', 'application/pdf', 2048500, 5, 'approved', 'd683b549-bcfd-4a11-b4c6-dfbc8a2d1d3b', now(), now(), now())
on conflict (id) do nothing;

-- Add a comment on note 1
insert into public.comments (id, user_id, note_id, content, status, created_at, updated_at)
values
  (1, 'c683b549-bcfd-4a11-b4c6-dfbc8a2d1d3a', 1, 'Wah catatannya sangat lengkap dan membantu sekali untuk UAS!', 'visible', now(), now())
on conflict (id) do nothing;
