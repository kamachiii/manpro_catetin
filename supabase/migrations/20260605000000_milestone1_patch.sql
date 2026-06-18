-- Migration Patch: Milestone 1 Storage & Constraints Setup

-- 1. Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('notes-files', 'notes-files', false, 20971520, array['application/pdf']), -- 20MB, PDF only
  ('topup-proofs', 'topup-proofs', false, null, null),                        -- Private
  ('avatars', 'avatars', true, null, null)                                    -- Public
on conflict (id) do nothing;

-- Ensure storage RLS is enabled
-- alter table storage.objects enable row level security;

-- 2. Storage RLS Policies

-- 2.1 Avatars Bucket Policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users can update or delete their own avatar"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      or split_part(name, '/', 1) = auth.uid()::text
    )
  );

-- 2.2 Topup Proofs Bucket Policies
create policy "Only admin or owner can read topup proofs"
  on storage.objects for select
  using (
    bucket_id = 'topup-proofs'
    and (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      or split_part(name, '/', 2) = auth.uid()::text
    )
  );

create policy "Users can upload their own topup proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'topup-proofs'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "Admins can manage all topup proofs"
  on storage.objects for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 2.3 Notes Files Bucket Policies
create policy "Only uploader, downloader, or admin can read notes files"
  on storage.objects for select
  using (
    bucket_id = 'notes-files'
    and (
      -- Admin
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      -- Owner
      or exists (select 1 from public.notes where file_path = name and user_id = auth.uid())
      -- Downloader (purchased)
      or exists (
        select 1 from public.note_downloads nd
        join public.notes n on nd.note_id = n.id
        where n.file_path = name and nd.user_id = auth.uid()
      )
    )
  );

create policy "Users can upload their own notes files"
  on storage.objects for insert
  with check (
    bucket_id = 'notes-files'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "Users can update or delete their own notes files before approval"
  on storage.objects for all
  using (
    bucket_id = 'notes-files'
    and (
      -- Admin
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      -- Owner (only if pending)
      or exists (
        select 1 from public.notes
        where file_path = name and user_id = auth.uid() and status = 'pending'
      )
    )
  );

-- 3. Database constraints
alter table public.profiles
  add constraint check_coin_balance check (coin_balance >= 0);
