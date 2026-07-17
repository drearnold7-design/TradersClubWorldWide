# Course Platform — Phase 7 (rebuilt on Whop)

## Why the switch
Whop already runs a full course/community LMS: video hosting, drip content, progress tracking, its own completion certificates if you want them, plus checkout, subscriptions, and a customer-facing app. Building and maintaining that ourselves (the original Phase 1/7 `courses`/`lessons`/`lesson_progress` tables) duplicates work Whop already does well. The `courses`/`lessons`/`lesson_progress`/`lesson_bookmarks`/`certificates` tables from earlier phases are now marked deprecated in the schema (kept, not dropped, in case you want the history) — nothing in the app writes to them going forward.

## What we actually need to build (and did)
Just enough to (a) sell the course from our own domain and (b) keep our CRM/admin dashboard aware of who owns what, without re-implementing a full LMS:

- **`whop_memberships` table** — a thin mirror: profile → Whop membership/access pass/plan → status. This is the only new schema.
- **`lib/whop/client.ts`** — Whop SDK instance for webhook verification (and any future server-side API calls — refunds, look-ups, etc.)
- **`/api/whop/webhook`** — verifies the signature, then on `payment.succeeded` / `membership.went_valid` upserts the membership record, mirrors `course_sold` into the linked lead's pipeline stage, and logs an analytics event. On `membership.went_invalid`, marks it expired.
- **`WhopCheckoutEmbed.tsx`** — drops Whop's hosted checkout iframe directly onto our domain (customers never leave the site to pay) — supports light/dark theme and prefilled email
- **`/courses` (portal)** — checks `whop_memberships` for active access; shows "Continue on Whop" if owned, otherwise the checkout embed inline

## Setup steps on your end (I can't do these — they require your Whop account)
1. Create your Whop account/company if you haven't, and create the course as a product ("Access Pass") with a pricing Plan attached
2. Grab the Access Pass ID (`pass_...`) and Plan ID (`plan_...`) from the dashboard
3. Developer tab → generate an API key → `WHOP_API_KEY`
4. Developer tab → create a webhook pointed at `https://tradersclubworldwide.com/api/whop/webhook`, select `payment.succeeded`, `membership.went_valid`, `membership.went_invalid` → copy the signing secret → `WHOP_WEBHOOK_SECRET`
5. Add the loader script once, globally, in the root layout:
   ```html
   <script async defer src="https://js.whop.com/static/checkout/loader.js" />
   ```
6. If you set a Content-Security-Policy: allow `frame-src https://*.whop.com`, `script-src https://js.whop.com`, `connect-src https://*.whop.com`

## Env vars needed
```
WHOP_API_KEY=
WHOP_WEBHOOK_SECRET=
NEXT_PUBLIC_WHOP_COURSE_ACCESS_PASS_ID=
NEXT_PUBLIC_WHOP_COURSE_PLAN_ID=
NEXT_PUBLIC_WHOP_COURSE_URL=      # the hosted Whop experience URL customers land on after purchase
```

## New dependency
```
"@whop/sdk": "latest"
```

## Test before going live
Whop has a full sandbox (`sandbox.whop.com/dashboard`) with test card `4242 4242 4242 4242` — set `data-whop-checkout-environment="sandbox"` on the embed while testing, remove it (or set to `production`) when ready for real payments.
