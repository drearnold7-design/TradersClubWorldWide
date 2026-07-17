-- ============================================================
-- TRADERS CLUB WORLDWIDE — ROW LEVEL SECURITY POLICIES
-- Phase 2 of 10
-- Depends on: schema.sql (Phase 1)
-- ============================================================

-- ------------------------------------------------------------
-- HELPER: get the role of the currently authenticated user
-- ------------------------------------------------------------
create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_staff()
returns boolean as $$
  select auth_role() in ('owner','admin','sales','marketing','support');
$$ language sql stable security definer;

-- ============================================================
-- PROFILES
-- ============================================================
-- Anyone can read their own profile. Staff can read all profiles.
create policy "profiles_select_own_or_staff"
  on profiles for select
  using (id = auth.uid() or is_staff());

-- Users can update only their own profile; cannot change their own role.
create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

-- Only owner/admin can change roles or insert staff profiles directly.
create policy "profiles_admin_manage"
  on profiles for all
  using (auth_role() in ('owner','admin'));

-- ============================================================
-- LEADS  (CRM — sales/marketing/admin only, customers never see leads table)
-- ============================================================
create policy "leads_staff_full_access"
  on leads for all
  using (auth_role() in ('owner','admin','sales','marketing'));

create policy "leads_support_read_only"
  on leads for select
  using (auth_role() = 'support');

-- ============================================================
-- LEAD TASKS
-- ============================================================
create policy "lead_tasks_staff_access"
  on lead_tasks for all
  using (is_staff());

-- ============================================================
-- EVENTS  (public read for anyone — needed for the public landing page)
-- ============================================================
create policy "events_public_read"
  on events for select
  using (is_active = true);

create policy "events_admin_manage"
  on events for all
  using (auth_role() in ('owner','admin'));

-- ============================================================
-- BOOKINGS
-- ============================================================
create policy "bookings_owner_read"
  on bookings for select
  using (profile_id = auth.uid() or is_staff());

create policy "bookings_owner_insert"
  on bookings for insert
  with check (profile_id = auth.uid());

create policy "bookings_staff_manage"
  on bookings for update
  using (is_staff());

-- ============================================================
-- PAYMENTS  (never editable by customers directly — Stripe webhook writes via service role)
-- ============================================================
create policy "payments_owner_read"
  on payments for select
  using (profile_id = auth.uid() or is_staff());

create policy "payments_staff_only_write"
  on payments for insert
  with check (is_staff());

-- ============================================================
-- COUPONS  (staff manage; validated server-side at checkout, not client-readable list)
-- ============================================================
create policy "coupons_admin_manage"
  on coupons for all
  using (auth_role() in ('owner','admin','marketing'));

-- ============================================================
-- COURSES / LESSONS  (published courses readable by enrolled users; staff manage all)
-- ============================================================
create policy "courses_public_read_published"
  on courses for select
  using (is_published = true);

create policy "courses_admin_manage"
  on courses for all
  using (auth_role() in ('owner','admin'));

create policy "lessons_enrolled_read"
  on lessons for select
  using (
    exists (
      select 1 from course_enrollments ce
      where ce.course_id = lessons.course_id and ce.profile_id = auth.uid()
    )
    or is_staff()
  );

create policy "lessons_admin_manage"
  on lessons for all
  using (auth_role() in ('owner','admin'));

-- ============================================================
-- COURSE ENROLLMENTS / LESSON PROGRESS
-- ============================================================
create policy "enrollments_own_read"
  on course_enrollments for select
  using (profile_id = auth.uid() or is_staff());

create policy "enrollments_staff_insert"
  on course_enrollments for insert
  with check (is_staff() or profile_id = auth.uid());

create policy "progress_own_read_write"
  on lesson_progress for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ============================================================
-- REFERRALS
-- ============================================================
create policy "referral_clicks_insert_anyone"
  on referral_clicks for insert
  with check (true);   -- tracking pixel-style insert, no auth required

create policy "referral_clicks_staff_read"
  on referral_clicks for select
  using (is_staff());

create policy "referral_rewards_own_read"
  on referral_rewards for select
  using (referrer_id = auth.uid() or is_staff());

create policy "referral_rewards_staff_manage"
  on referral_rewards for all
  using (is_staff());

-- ============================================================
-- MESSAGE TEMPLATES  (admin/marketing edit; used server-side only, never client-read broadly)
-- ============================================================
create policy "templates_admin_manage"
  on message_templates for all
  using (auth_role() in ('owner','admin','marketing'));

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
create policy "tickets_own_or_staff_read"
  on support_tickets for select
  using (profile_id = auth.uid() or auth_role() in ('owner','admin','support'));

create policy "tickets_own_insert"
  on support_tickets for insert
  with check (profile_id = auth.uid());

create policy "tickets_staff_update"
  on support_tickets for update
  using (auth_role() in ('owner','admin','support'));

-- ============================================================
-- AUDIT LOGS  (owner/admin only — never editable, insert via service role/triggers)
-- ============================================================
create policy "audit_logs_admin_read"
  on audit_logs for select
  using (auth_role() in ('owner','admin'));

-- ============================================================
-- ANALYTICS EVENTS  (insert open for tracking, read staff-only)
-- ============================================================
create policy "analytics_insert_anyone"
  on analytics_events for insert
  with check (true);

create policy "analytics_staff_read"
  on analytics_events for select
  using (is_staff());
