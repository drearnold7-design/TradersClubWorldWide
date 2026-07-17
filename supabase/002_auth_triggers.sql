-- ============================================================
-- AUTH TRIGGERS — auto-create profile + referral code on signup
-- Phase 2 of 10
-- ============================================================

-- Generates a short, unique, URL-safe referral code, e.g. "dre7f2a"
create or replace function generate_referral_code(base_name text)
returns text as $$
declare
  slug text;
  candidate text;
  suffix text;
begin
  slug := lower(regexp_replace(coalesce(base_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));
  slug := left(slug, 8);
  loop
    suffix := substr(md5(random()::text), 1, 4);
    candidate := slug || suffix;
    exit when not exists (select 1 from profiles where referral_code = candidate);
  end loop;
  return candidate;
end;
$$ language plpgsql;

-- Fires when a new row is added to Supabase's auth.users (i.e. on signup)
create or replace function handle_new_user()
returns trigger as $$
declare
  ref_code text;
begin
  ref_code := generate_referral_code(
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1))
  );

  insert into profiles (id, email, first_name, last_name, phone, role, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'customer',   -- everyone starts as a customer; staff roles assigned manually by an admin
    ref_code
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
