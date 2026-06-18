-- Secure transactional RPCs by checking auth.uid() matches inputs and role permissions
-- Since these functions are SECURITY DEFINER, they run with superuser privileges.
-- Explicit auth.uid() verification prevents guest or normal users from calling them maliciously.

-- 1. Secure handle_note_download
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
  -- Security check: Caller must be authenticated and match the requested downloader user id
  if auth.uid() is null or auth.uid() != p_user_id then
    return json_build_object('success', false, 'message', 'Unauthorized: User is not authenticated or mismatches account');
  end if;

  -- Check if already purchased
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

  -- Lock the profile row for update
  select coin_balance into v_current_balance
  from public.profiles
  where id = p_user_id
  for update;

  if v_current_balance < v_coin_price then
    return json_build_object('success', false, 'message', 'Saldo koin tidak cukup');
  end if;

  -- Execute Transaction
  update public.profiles
  set coin_balance = coin_balance - v_coin_price
  where id = p_user_id;

  insert into public.note_downloads (user_id, note_id, coin_spent)
  values (p_user_id, p_note_id, v_coin_price)
  returning id into v_new_download_id;

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

  update public.notes
  set download_count = download_count + 1
  where id = p_note_id;

  return json_build_object('success', true, 'message', 'Download berhasil', 'file_path', v_note_file_path);
end;
$$ language plpgsql security definer;


-- 2. Secure handle_note_approval
create or replace function public.handle_note_approval(
  p_note_id bigint,
  p_admin_id uuid
) returns json as $$
declare
  v_uploader_id uuid;
  v_current_balance integer;
  v_status varchar;
begin
  -- Security check: Caller must be authenticated, match the p_admin_id, and hold the admin role
  if auth.uid() is null or auth.uid() != p_admin_id or not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    return json_build_object('success', false, 'message', 'Unauthorized: Admin privileges required');
  end if;

  select user_id, status into v_uploader_id, v_status
  from public.notes
  where id = p_note_id;

  if v_status != 'pending' then
    return json_build_object('success', false, 'message', 'Catatan tidak dalam status pending');
  end if;

  -- Approve Note
  update public.notes
  set status = 'approved',
      approved_by = p_admin_id,
      approved_at = now()
  where id = p_note_id;

  -- Lock the profile row for update
  select coin_balance into v_current_balance
  from public.profiles
  where id = v_uploader_id
  for update;

  -- Reward +5 Coins
  update public.profiles
  set coin_balance = coin_balance + 5
  where id = v_uploader_id;

  -- Audit Coin Transaction
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


-- 3. Secure handle_topup_approval
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
  -- Security check: Caller must be authenticated, match the p_admin_id, and hold the admin role
  if auth.uid() is null or auth.uid() != p_admin_id or not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    return json_build_object('success', false, 'message', 'Unauthorized: Admin privileges required');
  end if;

  select user_id, coin_amount, status into v_user_id, v_coin_amount, v_status
  from public.topups
  where id = p_topup_id;

  if v_status != 'pending' then
    return json_build_object('success', false, 'message', 'Top up tidak dalam status pending');
  end if;

  -- Update Topup Status
  update public.topups
  set status = 'success',
      verified_by = p_admin_id,
      verified_at = now()
  where id = p_topup_id;

  -- Lock the profile row for update
  select coin_balance into v_current_balance
  from public.profiles
  where id = v_user_id
  for update;

  -- Update Balance
  update public.profiles
  set coin_balance = coin_balance + v_coin_amount
  where id = v_user_id;

  -- Audit Coin Transaction
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
