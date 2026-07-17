-- ============================================================
-- REFERRAL SYSTEM — Phase 8
-- Adds admin-configurable reward rules + auto-reward triggers
-- (referral_clicks, referral_rewards already exist from Phase 1)
-- ============================================================

-- ------------------------------------------------------------
-- REFERRAL RULES — the "no-code" config table.
-- Admin edits rows here (via the admin UI) instead of a developer
-- editing reward logic in code every time the program changes.
-- ------------------------------------------------------------
create table referral_rules (
  id uuid primary key default uuid_generate_v4(),
  trigger_event text not null,        -- 'booking_paid_in_full', 'booking_deposit_paid', 'whop_course_purchased'
  reward_type text not null,          -- 'cash', 'trip_discount', 'course_access', 'vip_upgrade'
  reward_value numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_referral_rules_updated before update on referral_rules
  for each row execute function touch_updated_at();

alter table referral_rules enable row level security;

create policy "referral_rules_public_read_active"
  on referral_rules for select
  using (is_active = true);   -- app code needs to read active rules to apply them

create policy "referral_rules_admin_manage"
  on referral_rules for all
  using (auth_role() in ('owner','admin'));

-- Prevent duplicate reward records if a webhook ever fires twice for
-- the same event (Stripe/Whop both retry on non-2xx responses)
alter table referral_rewards
  add constraint uniq_referral_reward unique (referrer_id, referred_profile_id, booking_id, reward_type);

-- Seed a sensible default so the program works out of the box
insert into referral_rules (trigger_event, reward_type, reward_value) values
  ('booking_paid_in_full', 'cash', 250.00),
  ('booking_deposit_paid', 'cash', 50.00),
  ('whop_course_purchased', 'course_access', 0);

-- ------------------------------------------------------------
-- FUNCTION: award a referral reward when a qualifying event happens.
-- Called from application code (webhook handlers) rather than a DB
-- trigger, because it needs to know which specific event just fired —
-- keeps the logic in one obvious place instead of scattered triggers.
-- ------------------------------------------------------------
create or replace function award_referral_reward(
  p_referred_profile_id uuid,
  p_trigger_event text,
  p_booking_id uuid default null
)
returns void as $$
declare
  v_referrer_id uuid;
  v_rule referral_rules%rowtype;
begin
  select referred_by into v_referrer_id from profiles where id = p_referred_profile_id;
  if v_referrer_id is null then
    return; -- this customer wasn't referred by anyone, nothing to award
  end if;

  select * into v_rule from referral_rules
  where trigger_event = p_trigger_event and is_active = true
  limit 1;

  if v_rule.id is null then
    return; -- no active rule configured for this event
  end if;

  insert into referral_rewards (referrer_id, referred_profile_id, booking_id, reward_type, reward_value, status)
  values (v_referrer_id, p_referred_profile_id, p_booking_id, v_rule.reward_type, v_rule.reward_value, 'pending')
  on conflict do nothing;
end;
$$ language plpgsql security definer;
