-- ============================================================
-- WHOP INTEGRATION — Phase 7 (revised)
-- Replaces the custom courses/lessons/lesson_progress build from the
-- original Phase 1 schema. Whop hosts the actual course content, video
-- delivery, drip scheduling, and community — we only need a thin table
-- that mirrors membership status so the CRM/admin dashboard and portal
-- can show "does this customer have course access" without calling the
-- Whop API on every page load.
-- ============================================================

create type whop_membership_status as enum ('active', 'expired', 'cancelled', 'trialing');

create table whop_memberships (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  whop_membership_id text unique not null,   -- e.g. mem_DWWmfqMNSk5TVF
  whop_access_pass_id text not null,          -- e.g. pass_mPTCDbFCVK0Qs  (= the course/product)
  whop_plan_id text,                          -- e.g. plan_gU2ZhthbGX4ez  (= the specific pricing plan they bought)
  product_name text,                          -- denormalized for fast display in CRM/admin, no join needed
  status whop_membership_status not null default 'active',
  purchased_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_whop_memberships_profile on whop_memberships(profile_id);
create index idx_whop_memberships_status on whop_memberships(status);

alter table whop_memberships enable row level security;

create policy "whop_memberships_own_read"
  on whop_memberships for select
  using (profile_id = auth.uid() or is_staff());

-- staff (not customers) can freely manage records if a manual fix is ever needed
create policy "whop_memberships_staff_manage"
  on whop_memberships for all
  using (is_staff());

create trigger trg_whop_memberships_updated before update on whop_memberships
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------
-- Deprecating the old custom course tables from Phase 1/7
-- (kept, not dropped, in case you want to migrate content history —
-- but nothing in the app should write to these going forward)
-- ------------------------------------------------------------
comment on table courses is 'DEPRECATED as of Whop integration — course content now lives on Whop. Kept for historical reference only.';
comment on table lessons is 'DEPRECATED as of Whop integration.';
comment on table lesson_progress is 'DEPRECATED as of Whop integration — Whop tracks its own lesson/progress data natively.';
comment on table course_enrollments is 'DEPRECATED as of Whop integration — see whop_memberships instead.';
comment on table lesson_bookmarks is 'DEPRECATED as of Whop integration.';
comment on table certificates is 'DEPRECATED as of Whop integration — Whop issues its own completion tracking per product, if enabled.';
