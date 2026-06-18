-- Create Note Reviews Table
create table public.note_reviews (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_id bigint not null references public.notes(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_user_note_review unique(user_id, note_id)
);

-- Enable RLS
alter table public.note_reviews enable row level security;

-- Policies
create policy "Anyone can view reviews" on public.note_reviews
  for select using (true);

create policy "Users can insert a review if they downloaded the note" on public.note_reviews
  for insert with check (
    auth.uid() = user_id 
    and exists (
      select 1 from public.note_downloads 
      where user_id = auth.uid() and note_id = note_reviews.note_id
    )
    and not exists (
      select 1 from public.notes
      where id = note_reviews.note_id and user_id = auth.uid()
    )
  );

create policy "Users can update their own reviews" on public.note_reviews
  for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews" on public.note_reviews
  for delete using (auth.uid() = user_id);

create policy "Admins can manage all reviews" on public.note_reviews
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Grants
grant select, insert, update, delete on public.note_reviews to authenticated, anon;
grant select, insert, update, delete on public.note_reviews to service_role, postgres;
grant usage, select on all sequences in schema public to authenticated, anon;
grant usage, select on all sequences in schema public to service_role, postgres;
