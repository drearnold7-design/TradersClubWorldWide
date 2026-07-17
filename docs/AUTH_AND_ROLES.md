# Authentication & User Roles — Phase 2

## 1. Auth provider
Supabase Auth handles signup/login (email+password, magic link, and optionally Google/Apple OAuth for lower-friction checkout). No custom auth code needed — reduces security surface area significantly vs. rolling our own.

## 2. Roles

| Role | Who | Access |
|---|---|---|
| owner | Daniel Gamble | Everything, including role management and financial reports |
| admin | Ops/Dre | Everything except cannot remove the owner |
| sales | Sales reps | CRM, pipeline, lead tasks — no financial config, no template/CMS editing |
| marketing | Marketing team | CRM (read/write leads + campaigns), coupons, message templates, analytics |
| support | Support staff | Support tickets, read-only CRM (to answer customer questions) |
| customer | Anyone who books/buys | Own portal, own bookings, own course progress, own referral dashboard |
| affiliate | Referral partners w/o a purchase | Own referral dashboard only — no portal/trip content |

Every new signup defaults to `customer`. Staff roles are assigned manually by an owner/admin — this is intentional: nobody self-elevates to a staff role, ever.

## 3. How it's enforced (defense in depth — 2 layers)

1. **Middleware** (`middleware.ts`) — blocks the page request itself before it renders, redirecting unauthenticated or under-privileged users.
2. **Row Level Security** (`policies.sql`, Phase 1 schema) — blocks the *data* at the database layer regardless of what the frontend does. This is the layer that actually matters for security — even if someone bypasses the UI and hits the API directly, RLS still applies.

Never rely on the frontend/middleware alone — that's UX, not security. RLS is the real gate.

## 4. Signup flow
1. User signs up (email/password or OAuth) → row lands in Supabase's built-in `auth.users`.
2. `handle_new_user()` trigger fires automatically → creates their `profiles` row, assigns role `customer`, and generates their unique referral code (e.g. `dre7f2a`) — so every customer has a referral link from second one, no separate "join affiliate program" step needed.
3. If they arrived via someone else's referral link, `referred_by` is set from a cookie/localStorage value captured on landing (wired in Phase 8).

## 5. Files delivered this phase
- `policies.sql` — full RLS policy set for every table from Phase 1
- `apps-web-middleware.ts` — Next.js middleware for route-level protection (goes in `apps/web/middleware.ts`)
- `supabase-auth-triggers.sql` — auto-creates profile + referral code on signup

## 6. 2FA
Supabase Auth supports TOTP-based MFA natively. Recommend requiring it for `owner`/`admin` roles at minimum (financial data access) — this gets enabled as a project setting, not custom code, so it's a config step for Phase 10 (security hardening) rather than something to build now.
