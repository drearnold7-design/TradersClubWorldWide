# Traders Club Worldwide — Platform
Complete build, Phases 1–10

## What this is
A Next.js + Supabase + Stripe + Whop platform for the Trade & Travel Experience launch and beyond: marketing site with an interactive quiz, CRM with a drag-and-drop sales pipeline, Stripe checkout, a customer portal, Whop-hosted course delivery, a configurable referral program, and full analytics/reporting — all sharing one database so nothing has to be rebuilt when you add the next event, membership tier, or instructor down the road.

## Phase index
| Phase | Doc | What it covers |
|---|---|---|
| 1 | `ARCHITECTURE.md`, `ERD.md`, `schema.sql` | Tech stack, folder structure, full database schema |
| 2 | `AUTH_AND_ROLES.md` | 7 roles, RLS policies, middleware, signup triggers |
| 3 | `LANDING_PAGE_MARKETING.md` | Hero, quiz, FAQ, pricing, exit-intent, lead capture API |
| 4 | `CRM_ADMIN_DASHBOARD.md` | Dashboard widgets, CRM table, drag-and-drop pipeline |
| 5 | `PAYMENTS_CHECKOUT.md` | Stripe checkout, webhook, booking-before-payment pattern |
| 6 | `CUSTOMER_PORTAL.md` | Trip details, packing checklist, referrals, support, profile |
| 7 | `COURSE_PLATFORM_WHOP.md` | Whop integration (replaces the earlier custom LMS build) |
| 8 | `REFERRAL_SYSTEM.md` | Tracking links, no-code reward rules, auto-award, leaderboard |
| 9 | `ANALYTICS_REPORTING.md` | GA4/Meta/TikTok/Clarity, funnel tracking, admin reporting |
| 10 | This doc + `SECURITY_CHECKLIST.md`, `TESTING_STRATEGY.md`, `PERFORMANCE_OPTIMIZATION.md`, `ACCESSIBILITY_CHECKLIST.md`, `DEPLOYMENT_GUIDE.md` | Everything needed to actually ship it |

## What's real code vs. what needs your input
This entire build is real, working code against a real architecture — not mockups. But a handful of things were deliberately left as flagged placeholders rather than fabricated, because guessing at them would've meant either making up content attributed to Daniel/attendees, or building a feature (payment plan cadence, referral payout method) without knowing the actual business decision behind it:

1. **Daniel's real bio, photos, and testimonials** (Phase 3)
2. **Whop product/plan setup** — only you can create this on your Whop account (Phase 7)
3. **Payment plan/installment cadence** — needs your call on structure (Phase 5)
4. **Referral payout mechanism** — manual transfer vs. Stripe Connect (Phase 8)
5. **Real trip schedule/location** once finalized, replacing the placeholder itinerary (Phase 6)

Everything else — schema, auth, CRM, checkout, portal, referrals, analytics, security headers, deployment config — is ready to run once you plug in your actual API keys per `.env.example` and `DEPLOYMENT_GUIDE.md`.

## Immediate next step
Follow `DEPLOYMENT_GUIDE.md`'s "One-time setup" section top to bottom. Everything else in this repo assumes that's done first.
