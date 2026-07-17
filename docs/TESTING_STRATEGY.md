# Testing Strategy — Phase 10

## Layers
1. **Unit tests (Vitest)** — pure logic: pricing/coupon math in `/api/stripe/checkout`, referral reward rule matching, UTM parsing in `track.ts`
2. **Integration tests** — API routes against a local/test Supabase instance: lead creation, pipeline stage updates, webhook handlers (using Stripe's and Whop's official test-event fixtures)
3. **End-to-end (Playwright)** — the critical revenue paths, since these are what actually cost money if broken:
   - Full quiz → lead capture → confirmation flow
   - `/book` → Stripe checkout (Stripe test mode, card `4242 4242 4242 4242`) → webhook → booking status updates → portal shows correct balance
   - Whop checkout embed → webhook → course access unlocks in portal (Whop sandbox mode)
   - Referral link click → cookie set → signup → `referred_by` populated → purchase → reward created

## What to test before every deploy (minimum bar)
- [ ] Checkout completes in Stripe test mode and the webhook updates the booking correctly
- [ ] Whop sandbox purchase unlocks course access in the portal
- [ ] A new signup gets a referral code and (if `?ref=` was present) correct attribution
- [ ] RLS policies actually block cross-account access — log in as a test `customer` and confirm you cannot query another customer's `bookings`/`payments` via the browser console
- [ ] Admin dashboard numbers match a manual count for a known small data set

## Load/scale testing
Not needed at launch scale (20-seat capped event). Revisit when the "future expansion" phase (multiple simultaneous events, membership subscriptions) becomes real — that's when Supabase connection pooling and Next.js edge caching decisions actually start to matter.

## Test environments
- **Local**: `.env.local` pointed at a separate Supabase project (not production), Stripe test mode, Whop sandbox mode
- **Netlify deploy previews**: same test-mode keys, automatically provisioned per PR if you connect GitHub
- **Production**: live keys only after the above checklist passes on a deploy preview
