-- Grant standard table-level SQL privileges to service_role and postgres roles
-- This ensures the admin / backend clients have access to query and mutate tables.

grant select, insert, update, delete on public.semesters to service_role, postgres;
grant select, insert, update, delete on public.categories to service_role, postgres;
grant select, insert, update, delete on public.courses to service_role, postgres;
grant select, insert, update, delete on public.profiles to service_role, postgres;
grant select, insert, update, delete on public.notes to service_role, postgres;
grant select, insert, update, delete on public.note_downloads to service_role, postgres;
grant select, insert, update, delete on public.coin_transactions to service_role, postgres;
grant select, insert, update, delete on public.topups to service_role, postgres;
grant select, insert, update, delete on public.comments to service_role, postgres;

-- Grant usage and select on all sequences in schema public
grant usage, select on all sequences in schema public to service_role, postgres;
