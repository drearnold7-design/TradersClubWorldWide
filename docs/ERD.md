# Entity Relationship Summary — Phase 1

```
auth.users (Supabase built-in)
  └── profiles (1:1)
        ├── leads (1:many, via profile_id once converted)
        ├── bookings (1:many)
        │     ├── payments (1:many)
        │     └── event_id → events
        ├── course_enrollments (1:many) → courses → lessons → lesson_progress
        ├── referral_rewards (as referrer_id and referred_profile_id)
        └── support_tickets (1:many)

leads
  ├── campaign_id → campaigns
  ├── salesperson_id → profiles
  └── lead_tasks (1:many)

referral_clicks — standalone, matched to profiles.referral_code on conversion
message_templates — standalone, referenced by key from automation logic (Phase 2/9)
audit_logs — standalone, references any profile as actor_id
analytics_events — standalone, optional profile_id link
```

**Key design decisions:**
- `leads` and `profiles` are separate on purpose. A lead can exist for months before ever creating an account — merging them would force premature account creation and break the "quiz → capture → nurture" funnel.
- `bookings.balance_due` is a generated column (`total_price - amount_paid`), so it's always correct — no risk of it drifting out of sync in the CRM or admin dashboard.
- Every reward/referral/payment table stores a `status` field so nothing auto-completes — payouts and rewards need explicit approval, which matters for a cash-commission referral program.
- RLS is enabled on every table starting now, even though granular policies land in Phase 2. No table goes live world-readable, even temporarily.
