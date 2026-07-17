# Customer Portal — Phase 6

## Pages built
- **`/dashboard`** — overview: trip summary card (dates, paid/balance/status), referral link teaser
- **`/trip`** — full trip details: 8-day schedule, interactive packing checklist, receipts list
- **`/referrals`** — referral link, clicks, purchases, pending vs. paid reward totals
- **`/support`** — ticket submission, writes straight into `support_tickets` (Phase 1 schema)
- **`/profile`** — edit contact info, change password (via Supabase Auth's `updateUser`)

All pages read live from Supabase, gated by the Phase 2 middleware (`/dashboard/*` requires any authenticated role) and protected at the data layer by the Phase 2 RLS policies — a customer can only ever see their own `bookings`, `payments`, and `referral_rewards` rows, enforced by Postgres itself, not just the UI.

## What's using placeholder/starter content (by design, not oversight)
- **Schedule** — the day-by-day schedule is a reasonable starting structure (arrival, 3 live trading sessions, workshops, excursions, closing dinner) but should be replaced with Daniel's actual confirmed itinerary once finalized
- **Packing checklist** — sensible defaults; happy to tailor to the actual destination once the location is set (currently kept private per the "revealed upon deposit" hook from Phase 3)

## Not yet built (belongs to a later phase)
- **Course content within the portal** — the `/courses` nav link exists but the page itself is Phase 7
- **Travel documents upload/download** — needs Supabase Storage bucket + file upload UI; can add as a follow-up if you want it before Phase 10, or note it as a v1.1 item
