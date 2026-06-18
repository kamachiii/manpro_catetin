-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Semesters Table
create table public.semesters (
  id bigserial primary key,
  name varchar(50) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Categories Table
create table public.categories (
  id bigserial primary key,
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Courses Table
create table public.courses (
  id bigserial primary key,
  category_id bigint references public.categories(id) on delete set null,
  semester_id bigint references public.semesters(id) on delete set null,
  name varchar(120) not null,
  slug varchar(140) not null unique,
  code varchar(30),
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name varchar(100) not null,
  role varchar(20) not null default 'user',
  coin_balance integer not null default 0,
  nim varchar(30),
  major varchar(100),
  semester_id bigint references public.semesters(id) on delete set null,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint check_role check (role in ('user', 'admin'))
);

-- 5. Notes Table
create table public.notes (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id bigint references public.categories(id) on delete set null,
  course_id bigint references public.courses(id) on delete set null,
  semester_id bigint references public.semesters(id) on delete set null,
  title varchar(180) not null,
  slug varchar(220) not null unique,
  description text,
  file_path text not null,
  file_original_name varchar(255),
  file_type varchar(50),
  file_size bigint,
  coin_price integer not null default 3,
  status varchar(20) not null default 'pending',
  rejection_reason text,
  download_count integer not null default 0,
  view_count integer not null default 0,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint check_status check (status in ('pending', 'approved', 'rejected')),
  constraint check_rejection_reason check (status != 'rejected' or (status = 'rejected' and rejection_reason is not null))
);

-- 6. Note Downloads Table
create table public.note_downloads (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_id bigint not null references public.notes(id) on delete cascade,
  coin_spent integer not null,
  downloaded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_user_note_download unique(user_id, note_id)
);

-- 7. Coin Transactions Table
create table public.coin_transactions (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type varchar(30) not null,
  amount integer not null,
  balance_before integer not null,
  balance_after integer not null,
  description text,
  reference_type varchar(50),
  reference_id bigint,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint check_transaction_type check (type in ('topup', 'download', 'upload_reward', 'admin_adjustment'))
);

-- 8. Topups Table
create table public.topups (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  coin_amount integer not null,
  payment_method varchar(30) not null,
  proof_image text,
  status varchar(20) not null default 'pending',
  admin_note text,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint check_topup_status check (status in ('pending', 'success', 'rejected')),
  constraint check_payment_method check (payment_method in ('transfer_bank', 'qris', 'ewallet'))
);

-- 9. Comments Table
create table public.comments (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_id bigint not null references public.notes(id) on delete cascade,
  content text not null,
  status varchar(20) not null default 'visible',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint check_comment_status check (status in ('visible', 'hidden'))
);

-- 10. Indexes
create index idx_notes_status on public.notes(status);
create index idx_notes_user_id on public.notes(user_id);
create index idx_notes_category_id on public.notes(category_id);
create index idx_notes_course_id on public.notes(course_id);
create index idx_notes_semester_id on public.notes(semester_id);
create index idx_notes_title on public.notes(title);
create index idx_comments_note_id on public.comments(note_id);
create index idx_topups_status on public.topups(status);
create index idx_coin_transactions_user_id on public.coin_transactions(user_id);
create index idx_note_downloads_user_id on public.note_downloads(user_id);
create index idx_note_downloads_note_id on public.note_downloads(note_id);

-- 11. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.notes enable row level security;
alter table public.note_downloads enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.topups enable row level security;
alter table public.comments enable row level security;

-- 12. Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile fields" on public.profiles for update 
  using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and (role = (select role from public.profiles where id = auth.uid())) -- Cannot alter own role
    and (coin_balance = (select coin_balance from public.profiles where id = auth.uid())) -- Cannot alter own balance
  );
create policy "Admins have full access on profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 13. Semesters, Categories, Courses Policies (Public Read, Admin Write)
create policy "Anyone can read semesters" on public.semesters for select using (true);
create policy "Admins can modify semesters" on public.semesters for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone can read categories" on public.categories for select using (true);
create policy "Admins can modify categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone can read courses" on public.courses for select using (true);
create policy "Admins can modify courses" on public.courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 14. Notes Policies
create policy "Anyone can view approved notes" on public.notes for select using (status = 'approved');
create policy "Users can view their own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Admins can view all notes" on public.notes for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own pending notes" on public.notes for update using (
  auth.uid() = user_id and status = 'pending'
);
create policy "Admins can update status and metadata of all notes" on public.notes for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 15. Note Downloads Policies
create policy "Users can view their own downloads" on public.note_downloads for select using (auth.uid() = user_id);
create policy "Admins can view all downloads" on public.note_downloads for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 16. Coin Transactions Policies
create policy "Users can view their own coin transactions" on public.coin_transactions for select using (auth.uid() = user_id);
create policy "Admins can view all coin transactions" on public.coin_transactions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 17. Topups Policies
create policy "Users can view their own topups" on public.topups for select using (auth.uid() = user_id);
create policy "Users can submit topups" on public.topups for insert with check (auth.uid() = user_id);
create policy "Admins can view and update all topups" on public.topups for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 18. Comments Policies
create policy "Anyone can view visible comments" on public.comments for select using (status = 'visible');
create policy "Users can insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Admins can moderate comments" on public.comments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- ==========================================
-- TRIGGERS & RPC FUNCTIONS
-- ==========================================

-- Trigger: Auto-create profile record upon sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, coin_balance, nim, major, semester_id, avatar_url, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Mahasiswa Baru'),
    'user',
    0,
    null,
    null,
    null,
    null,
    true
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Transaction RPC: Handle Note Download
create or replace function public.handle_note_download(
  p_user_id uuid,
  p_note_id bigint
) returns json as $$
declare
  v_coin_price integer;
  v_current_balance integer;
  v_already_downloaded boolean;
  v_note_file_path text;
  v_new_download_id bigint;
begin
  -- 1. Check if already purchased
  select exists(
    select 1 from public.note_downloads
    where user_id = p_user_id and note_id = p_note_id
  ) into v_already_downloaded;

  select file_path, coin_price into v_note_file_path, v_coin_price
  from public.notes
  where id = p_note_id and status = 'approved';

  if v_note_file_path is null then
    return json_build_object('success', false, 'message', 'Catatan tidak ditemukan atau belum disetujui');
  end if;

  if v_already_downloaded then
    return json_build_object('success', true, 'message', 'Sudah pernah diunduh', 'file_path', v_note_file_path);
  end if;

  -- 2. Fetch User Coin Balance
  select coin_balance into v_current_balance
  from public.profiles
  where id = p_user_id;

  if v_current_balance < v_coin_price then
    return json_build_object('success', false, 'message', 'Saldo koin tidak cukup');
  end if;

  -- 3. Execute Transaction
  -- Deduct Coin from Profile
  update public.profiles
  set coin_balance = coin_balance - v_coin_price
  where id = p_user_id;

  -- Log Download record
  insert into public.note_downloads (user_id, note_id, coin_spent)
  values (p_user_id, p_note_id, v_coin_price)
  returning id into v_new_download_id;

  -- Audit Coin Transaction
  insert into public.coin_transactions (user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id)
  values (
    p_user_id,
    'download',
    -v_coin_price,
    v_current_balance,
    v_current_balance - v_coin_price,
    'Mengunduh catatan ID: ' || p_note_id,
    'note_downloads',
    v_new_download_id
  );

  -- Increment note's download counter
  update public.notes
  set download_count = download_count + 1
  where id = p_note_id;

  return json_build_object('success', true, 'message', 'Download berhasil', 'file_path', v_note_file_path);
end;
$$ language plpgsql security definer;


-- Transaction RPC: Handle Note Approval + Reward
create or replace function public.handle_note_approval(
  p_note_id bigint,
  p_admin_id uuid
) returns json as $$
declare
  v_uploader_id uuid;
  v_current_balance integer;
  v_status varchar;
begin
  select user_id, status into v_uploader_id, v_status
  from public.notes
  where id = p_note_id;

  if v_status != 'pending' then
    return json_build_object('success', false, 'message', 'Catatan tidak dalam status pending');
  end if;

  -- 1. Approve Note
  update public.notes
  set status = 'approved',
      approved_by = p_admin_id,
      approved_at = now()
  where id = p_note_id;

  -- 2. Fetch Uploader Coin Balance
  select coin_balance into v_current_balance
  from public.profiles
  where id = v_uploader_id;

  -- 3. Reward +5 Coins
  update public.profiles
  set coin_balance = coin_balance + 5
  where id = v_uploader_id;

  -- 4. Audit Coin Transaction
  insert into public.coin_transactions (user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id)
  values (
    v_uploader_id,
    'upload_reward',
    5,
    v_current_balance,
    v_current_balance + 5,
    'Reward upload catatan ID: ' || p_note_id || ' disetujui',
    'notes',
    p_note_id
  );

  return json_build_object('success', true, 'message', 'Catatan berhasil disetujui');
end;
$$ language plpgsql security definer;


-- Transaction RPC: Handle Top Up Approval
create or replace function public.handle_topup_approval(
  p_topup_id bigint,
  p_admin_id uuid
) returns json as $$
declare
  v_user_id uuid;
  v_coin_amount integer;
  v_status varchar;
  v_current_balance integer;
begin
  select user_id, coin_amount, status into v_user_id, v_coin_amount, v_status
  from public.topups
  where id = p_topup_id;

  if v_status != 'pending' then
    return json_build_object('success', false, 'message', 'Top up tidak dalam status pending');
  end if;

  -- 1. Update Topup Status
  update public.topups
  set status = 'success',
      verified_by = p_admin_id,
      verified_at = now()
  where id = p_topup_id;

  -- 2. Fetch User Current Balance
  select coin_balance into v_current_balance
  from public.profiles
  where id = v_user_id;

  -- 3. Update Balance
  update public.profiles
  set coin_balance = coin_balance + v_coin_amount
  where id = v_user_id;

  -- 4. Audit Coin Transaction
  insert into public.coin_transactions (user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id)
  values (
    v_user_id,
    'topup',
    v_coin_amount,
    v_current_balance,
    v_current_balance + v_coin_amount,
    'Top up koin disetujui',
    'topups',
    p_topup_id
  );

  return json_build_object('success', true, 'message', 'Top up koin berhasil disetujui');
end;
$$ language plpgsql security definer;
