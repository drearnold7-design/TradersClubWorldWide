# Analytics & Reporting — Phase 9

## What's built
- **Root layout (`app/layout.tsx`)** — loads GA4, Meta Pixel, TikTok Pixel, and Microsoft Clarity exactly once, globally (fixing the Phase 3 flag about scattered pixel loading)
- **`lib/analytics/track.ts`** — one function (`track()`) that fires to our own `analytics_events` table AND GA4 AND Meta AND TikTok simultaneously, so the funnel never drifts out of sync between platforms. Also captures UTM params into `sessionStorage` on landing so later events in the same session stay attributed correctly even after navigating away from the original URL.
- **Wired into the actual funnel**: `quiz_started` / `quiz_completed` (Quiz.tsx), `lead_captured` (Quiz.tsx + `/api/leads`), `checkout_started` (`/book`), `purchase_completed` (Stripe webhook)
- **`/admin/analytics`** — the reporting dashboard: date-range filter, full conversion funnel (quiz → lead → checkout → purchase) with completion rates, top 5 campaigns, top 5 traffic sources, bookings/rooms-remaining/abandoned-checkouts

## This closes out the Phase 4 flag
The dashboard widgets deferred from Phase 4 (visitors, top campaign, top traffic source, abandoned checkouts, capacity) are now live — visitor-level counts come from GA4 directly (Google's own dashboard is more accurate for that than re-deriving it from our event log), while campaign/source/funnel/capacity numbers are computed here since they depend on our own `leads`/`bookings` data joined with UTM attribution.

## Env vars needed
```
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_CLARITY_ID=
```

## Note on "abandoned checkout" count
This works because of the Phase 5 decision to create the `bookings` row *before* redirecting to Stripe — a booking stuck in `not_booked` status past a reasonable window (say, 1 hour) is exactly what this counts. Recovery emails for these are a Phase-10-adjacent automation task (needs Resend wiring, covered next).
