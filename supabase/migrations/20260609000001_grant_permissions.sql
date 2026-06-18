-- Grant table-level SQL privileges to authenticated and anon roles
-- This ensures the database roles have standard select, insert, update, and delete access,
-- which will then be properly restricted by the active Row Level Security (RLS) policies.

grant select, insert, update, delete on public.semesters to authenticated, anon;
grant select, insert, update, delete on public.categories to authenticated, anon;
grant select, insert, update, delete on public.courses to authenticated, anon;
grant select, insert, update, delete on public.profiles to authenticated, anon;
grant select, insert, update, delete on public.notes to authenticated, anon;
grant select, insert, update, delete on public.note_downloads to authenticated, anon;
grant select, insert, update, delete on public.coin_transactions to authenticated, anon;
grant select, insert, update, delete on public.topups to authenticated, anon;
grant select, insert, update, delete on public.comments to authenticated, anon;

-- Grant sequence usage and select privileges for serial IDs
grant usage, select on all sequences in schema public to authenticated, anon;
