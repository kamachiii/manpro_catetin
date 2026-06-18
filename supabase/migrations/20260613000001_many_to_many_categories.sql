-- 1. Create junction table
create table public.note_categories_junction (
  note_id bigint not null references public.notes(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,
  primary key (note_id, category_id)
);

-- 2. Migrate existing one-to-many category relationships to many-to-many junction table
insert into public.note_categories_junction (note_id, category_id)
select id, category_id from public.notes where category_id is not null
on conflict do nothing;

-- 3. Drop old category_id column from public.notes
alter table public.notes drop column category_id;

-- 4. Enable Row Level Security (RLS) on junction table
alter table public.note_categories_junction enable row level security;

-- 5. RLS Policies
create policy "Anyone can view note categories" on public.note_categories_junction
  for select using (true);

create policy "Users can insert note categories for their own notes" on public.note_categories_junction
  for insert with check (
    exists (
      select 1 from public.notes
      where id = note_id and user_id = auth.uid()
    )
  );

create policy "Users can delete note categories for their own notes" on public.note_categories_junction
  for delete using (
    exists (
      select 1 from public.notes
      where id = note_id and user_id = auth.uid()
    )
  );

create policy "Admins can manage note categories" on public.note_categories_junction
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. Grants
grant select, insert, update, delete on public.note_categories_junction to authenticated, anon;
grant select, insert, update, delete on public.note_categories_junction to service_role, postgres;
grant usage, select on all sequences in schema public to authenticated, anon;
grant usage, select on all sequences in schema public to service_role, postgres;
