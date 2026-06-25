-- Reset and synchronize auto-increment sequences for tables seeded with explicit IDs.
-- This prevents "duplicate key value violates unique constraint" errors on new inserts.

SELECT setval('public.courses_id_seq', COALESCE((SELECT MAX(id) FROM public.courses), 1));
SELECT setval('public.categories_id_seq', COALESCE((SELECT MAX(id) FROM public.categories), 1));
SELECT setval('public.semesters_id_seq', COALESCE((SELECT MAX(id) FROM public.semesters), 1));
