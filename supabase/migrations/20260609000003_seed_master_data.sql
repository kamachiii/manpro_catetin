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
  (8, 6, 1, 'Bahasa Indonesia', 'bahasa-indonesia', 'IK104', 'Mata kuliah tata tulis bahasa Indonesia dan penulisan ilmiah.'),
  (9, 8, 6, 'Virtualisasi dan Keamanan Jaringan', 'virtualisasi-dan-keamanan-jaringan', 'IK301', 'Mata kuliah seputar teknologi virtualisasi dan keamanan sistem jaringan.')
on conflict (id) do nothing;
