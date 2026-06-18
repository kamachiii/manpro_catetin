-- Fix infinite recursion in public.profiles policies
-- Drop the recursive ALL policy for admins on profiles
drop policy if exists "Admins have full access on profiles" on public.profiles;

-- Recreate admin policies restricted to INSERT, UPDATE, and DELETE
create policy "Admins can insert profiles" on public.profiles for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can update profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can delete profiles" on public.profiles for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
