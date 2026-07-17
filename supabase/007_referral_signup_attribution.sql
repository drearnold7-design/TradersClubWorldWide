-- ============================================================
-- REFERRAL ATTRIBUTION ON SIGNUP — Phase 8 addendum to Phase 2's
-- handle_new_user() trigger. Replaces that function to also set
-- referred_by when a referral code was captured client-side.
--
-- The client (signup form) reads the `tcw_referral_code` cookie set by
-- /r/[code] and passes it as user metadata on signup:
--   supabase.auth.signUp({ email, password, options: { data: {
--     referral_code_used: cookieValue, first_name, last_name, phone
--   }}})
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  ref_code text;
  referrer_profile_id uuid;
begin
  ref_code := generate_referral_code(
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1))
  );

  -- Look up whoever owns the referral code that was captured on landing
  if new.raw_user_meta_data->>'referral_code_used' is not null then
    select id into referrer_profile_id
    from profiles
    where referral_code = new.raw_user_meta_data->>'referral_code_used';
  end if;

  insert into profiles (id, email, first_name, last_name, phone, role, referral_code, referred_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'customer',
    ref_code,
    referrer_profile_id
  );

  return new;
end;
$$ language plpgsql security definer;
