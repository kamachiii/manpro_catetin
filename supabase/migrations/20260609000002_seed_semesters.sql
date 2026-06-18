-- Seed Semesters table with static rows (Semester 1 - 8)
-- This ensures foreign key constraints are not violated when semester_id is saved.
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
