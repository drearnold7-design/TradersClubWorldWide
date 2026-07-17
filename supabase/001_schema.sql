-- ============================================================
-- TRADERS CLUB WORLDWIDE — DATABASE SCHEMA
-- Phase 1 of 10
-- Target: Supabase (Postgres 15+)
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum (
  'owner', 'admin', 'sales', 'marketing', 'support', 'customer', 'affiliate'
);

create type pipeline_stage as enum (
  'new_lead', 'contacted', 'qualified', 'deposit_paid',
  'balance_due', 'paid_in_full', 'checked_in', 'trip_completed',
  'course_sold', 'mentorship_sold', 'lost'
);

create type payment_status as enum (
  'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
);

create type trip_status as enum (
  'not_booked', 'deposit_paid', 'paid_in_full', 'checked_in', 'completed', 'cancelled'
);

create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');

-- ------------------------------------------------------------
-- PROFILES  (extends Supabase auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  first_name text,
  last_name text,
  email text unique not null,
  phone text,
  city text,
  state text,
  avatar_url text,
  referral_code text unique,               -- this user's own shareable code
  referred_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CAMPAIGNS  (ad campaign metadata for attribution)
-- ------------------------------------------------------------
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  platform text,                           -- facebook, tiktok, google, etc.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- LEADS  (core CRM record — one row per lead, promoted to profile on signup)
-- ------------------------------------------------------------
create table leads (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),  -- linked once they create an account
  first_name text,
  last_name text,
  email text not null,
  phone text,
  city text,
  state text,
  experience_level text,                    -- never traded / beginner / intermediate / experienced
  quiz_answers jsonb,                        -- raw quiz responses
  lead_source text,                          -- facebook, tiktok, referral, organic, etc.
  campaign_id uuid references campaigns(id),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code_used text,                   -- if they came via someone's referral link
  pipeline_stage pipeline_stage not null default 'new_lead',
  salesperson_id uuid references profiles(id),
  marketing_consent boolean default false,
  tags text[] default '{}',
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_pipeline_stage on leads(pipeline_stage);
create index idx_leads_email on leads(email);
create index idx_leads_created_at on leads(created_at);

-- ------------------------------------------------------------
-- LEAD TASKS  (follow-up tasks tied to a lead)
-- ------------------------------------------------------------
create table lead_tasks (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade,
  assigned_to uuid references profiles(id),
  title text not null,
  due_date timestamptz,
  is_complete boolean default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EVENTS  (Trade & Travel Experience, and future events)
-- ------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                        -- "Trade & Travel Experience — Aug 2026"
  start_date date not null,
  end_date date not null,
  capacity int not null,
  location text,
  base_price numeric(10,2) not null,
  deposit_amount numeric(10,2) not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- BOOKINGS  (a lead/customer reserving a spot at an event)
-- ------------------------------------------------------------
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) not null,
  profile_id uuid references profiles(id) not null,
  lead_id uuid references leads(id),
  trip_status trip_status not null default 'not_booked',
  total_price numeric(10,2) not null,
  amount_paid numeric(10,2) not null default 0,
  balance_due numeric(10,2) generated always as (total_price - amount_paid) stored,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_event on bookings(event_id);
create index idx_bookings_profile on bookings(profile_id);

-- ------------------------------------------------------------
-- PAYMENTS  (individual Stripe transactions against a booking)
-- ------------------------------------------------------------
create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  profile_id uuid references profiles(id),
  stripe_payment_intent_id text unique,
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  payment_method text,                      -- card, ach, apple_pay, google_pay
  is_deposit boolean default false,
  receipt_url text,
  created_at timestamptz not null default now()
);

create index idx_payments_booking on payments(booking_id);

-- ------------------------------------------------------------
-- COUPONS
-- ------------------------------------------------------------
create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text not null,              -- 'percent' or 'fixed'
  discount_value numeric(10,2) not null,
  max_uses int,
  times_used int default 0,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- COURSES / LESSONS / PROGRESS
-- ------------------------------------------------------------
create table courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price numeric(10,2),
  is_published boolean default false,
  created_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  video_url text,
  content text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table course_enrollments (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  course_id uuid references courses(id) not null,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (profile_id, course_id)
);

create table lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  lesson_id uuid references lessons(id) not null,
  is_complete boolean default false,
  video_progress_seconds int default 0,
  updated_at timestamptz not null default now(),
  unique (profile_id, lesson_id)
);

-- ------------------------------------------------------------
-- REFERRALS
-- ------------------------------------------------------------
create table referral_clicks (
  id uuid primary key default uuid_generate_v4(),
  referral_code text not null,
  landing_path text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table referral_rewards (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references profiles(id) not null,
  referred_profile_id uuid references profiles(id),
  booking_id uuid references bookings(id),
  reward_type text,                          -- cash, trip_discount, course_access, vip_upgrade
  reward_value numeric(10,2),
  status text default 'pending',             -- pending, approved, paid
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EMAIL / SMS TEMPLATES  (editable via admin CMS, no code changes needed)
-- ------------------------------------------------------------
create table message_templates (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,                  -- e.g. 'lead_confirmation_email'
  channel text not null,                     -- 'email' or 'sms'
  subject text,                              -- email only
  body text not null,
  is_active boolean default true,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SUPPORT TICKETS
-- ------------------------------------------------------------
create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  subject text not null,
  message text,
  status ticket_status not null default 'open',
  assigned_to uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- AUDIT LOG  (security requirement — track admin actions)
-- ------------------------------------------------------------
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ANALYTICS EVENTS  (lightweight internal event log, complements GA4)
-- ------------------------------------------------------------
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,                  -- 'quiz_started', 'checkout_started', etc.
  profile_id uuid references profiles(id),
  session_id text,
  utm_source text,
  utm_campaign text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_analytics_event_name on analytics_events(event_name);
create index idx_analytics_created_at on analytics_events(created_at);

-- ------------------------------------------------------------
-- updated_at auto-touch trigger (reused across tables)
-- ------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function touch_updated_at();
create trigger trg_leads_updated before update on leads
  for each row execute function touch_updated_at();
create trigger trg_bookings_updated before update on bookings
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (policies themselves land in Phase 2
-- alongside auth/roles — enabling now so no table is ever exposed
-- unprotected, even for a moment, once this ships)
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table leads enable row level security;
alter table lead_tasks enable row level security;
alter table events enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table course_enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table referral_clicks enable row level security;
alter table referral_rewards enable row level security;
alter table message_templates enable row level security;
alter table support_tickets enable row level security;
alter table audit_logs enable row level security;
alter table analytics_events enable row level security;
