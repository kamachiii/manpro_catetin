-- Create Note Bookmarks Table
create table public.note_bookmarks (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_id bigint not null references public.notes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_user_note_bookmark unique(user_id, note_id)
);

-- Enable RLS
alter table public.note_bookmarks enable row level security;

-- Policies
create policy "Users can view their own bookmarks" on public.note_bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks" on public.note_bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on public.note_bookmarks
  for delete using (auth.uid() = user_id);

create policy "Admins can manage all bookmarks" on public.note_bookmarks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Grants
grant select, insert, update, delete on public.note_bookmarks to authenticated, anon;
grant select, insert, update, delete on public.note_bookmarks to service_role, postgres;
grant usage, select on all sequences in schema public to authenticated, anon;
grant usage, select on all sequences in schema public to service_role, postgres;
