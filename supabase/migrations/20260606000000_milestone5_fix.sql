-- Migration Patch: Milestone 5 Transaction Integrity Fix
-- This migration updates handle_note_download, handle_note_approval, and handle_topup_approval RPCs
-- to use SELECT ... FOR UPDATE when reading the profile's coin_balance, preventing concurrency issues.

-- 1. Update handle_note_download
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
  -- Check if already purchased (does not lock the profile yet since we don't modify it if already downloaded)
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

  -- Lock the profile row for update to prevent race conditions on balance verification and audit logging
  select coin_balance into v_current_balance
  from public.profiles
  where id = p_user_id
  for update;

  if v_current_balance < v_coin_price then
    return json_build_object('success', false, 'message', 'Saldo koin tidak cukup');
  end if;

  -- Execute Transaction
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


-- 2. Update handle_note_approval
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

  -- Approve Note
  update public.notes
  set status = 'approved',
      approved_by = p_admin_id,
      approved_at = now()
  where id = p_note_id;

  -- Lock the profile row for update to prevent concurrent balance updates from causing transaction log discrepancies
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


-- 3. Update handle_topup_approval
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

  -- Update Topup Status
  update public.topups
  set status = 'success',
      verified_by = p_admin_id,
      verified_at = now()
  where id = p_topup_id;

  -- Lock the profile row for update to prevent concurrent balance updates from causing transaction log discrepancies
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
