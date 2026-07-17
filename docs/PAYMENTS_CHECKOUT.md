# Payments & Checkout — Phase 5

## Flow
1. Customer clicks a payment option on `/book` → `POST /api/stripe/checkout`
2. Route validates event capacity, validates any coupon, **creates a `bookings` row first** (status `not_booked`), then creates a Stripe Checkout Session with the booking ID in `metadata`
3. Customer pays on Stripe's hosted checkout page (handles card, Apple Pay, Google Pay, ACH natively — nothing custom needed for PCI compliance)
4. Stripe calls `POST /api/stripe/webhook` → this is the **only** place that ever marks a payment as succeeded. The success/cancel redirect URLs are for UX only and are never trusted for payment state.
5. Webhook updates `payments`, updates `bookings.amount_paid`/`trip_status`, mirrors the stage into the linked `leads.pipeline_stage`, and increments coupon usage.

## Why booking-before-payment matters
Creating the booking row before redirecting to Stripe means an abandoned checkout still leaves a trace — that `not_booked` booking is exactly what an "abandoned checkout" recovery email (Phase 9) queries for for. If we only wrote to the DB after a successful webhook, abandoned checkouts would be invisible.

## Security
- Webhook signature verification via `STRIPE_WEBHOOK_SECRET` — any request that doesn't match Stripe's signature is rejected outright
- Service-role Supabase client used only in these two server-side routes, never shipped to the browser
- Refunds (`charge.refunded`) and failed payments (`payment_intent.payment_failed`) both update `payments.status`, so the CRM/admin dashboard always reflects reality without manual reconciliation

## Payment plans
Full "installment plan" automation (auto-charging a saved card on a schedule) needs Stripe Subscriptions or Invoicing wired specifically to the balance-due amount — that's a config decision (how many installments, what cadence) I'd rather confirm with you before building, since it affects the checkout copy too.

## Env vars needed
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CURRENT_EVENT_ID=
```

## New dependency
```
"stripe": "^16.0.0"
```

## Not yet wired (flagging, not skipping)
- Gift cards — no gift-card table/flow built yet; wasn't in the Phase 1 schema. Can add in a follow-up pass if you want it for launch.
- Saved-card payment plans (see above) — needs your input on installment structure first.
