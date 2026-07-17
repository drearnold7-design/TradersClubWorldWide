# Deployment Guide — Phase 10

## One-time setup
1. **Supabase**: create a project → run every `.sql` file delivered across Phases 1, 2, 5, 7, 8 in order (schema → policies → auth triggers → payment functions → whop schema → referral schema/attribution) → copy the project URL + anon key + service role key
2. **Stripe**: create an account → get live secret key → create a webhook endpoint pointed at `https://tradersclubworldwide.com/api/stripe/webhook`, subscribe to `checkout.session.completed`, `charge.refunded`, `payment_intent.payment_failed` → copy the signing secret
3. **Whop**: create your course product/plan → generate an API key → create a webhook pointed at `https://tradersclubworldwide.com/api/whop/webhook`, subscribe to `payment.succeeded`, `membership.went_valid`, `membership.went_invalid` → copy the signing secret
4. **Analytics**: create GA4 property, Meta Pixel, TikTok Pixel, Microsoft Clarity project → copy each ID
5. **GitHub**: push this repo to a new GitHub repository
6. **Netlify**: "Import from Git" → select the repo → Netlify auto-detects `netlify.toml` → add every variable from `.env.example` in Site Settings → Environment Variables → deploy

## Every deploy after that
Push to `main` → Netlify builds and deploys automatically. Pull requests get their own deploy preview URL with the same environment variables (safe to test with Stripe/Whop test-mode keys on previews specifically, if you set up separate preview-context env vars).

## Domain
Point `tradersclubworldwide.com`'s DNS at Netlify (they provide the exact records after you add the custom domain in Site Settings → Domain Management). SSL is automatic via Let's Encrypt.

## Rollback
Netlify keeps every previous deploy — "Rollback to this deploy" is one click in the Deploys tab if a release breaks something. This is why webhook idempotency (Phase 5/8's duplicate-prevention) matters: a rollback plus Stripe's automatic webhook retries should never double-charge or double-award anything.

## Go-live checklist (final gate before switching Stripe/Whop to live mode)
- [ ] Every item in `SECURITY_CHECKLIST.md` addressed
- [ ] Every item in `TESTING_STRATEGY.md`'s "minimum bar" passed on a deploy preview
- [ ] Real bio/testimonial content added (flagged back in Phase 3 — still a placeholder until you provide it)
- [ ] Whop product/plan actually created and IDs added to env vars (Phase 7 — this is on you, not something I can do)
- [ ] Payment plan/installment structure decided (flagged in Phase 5)
- [ ] Referral payout mechanism decided — manual transfer vs. Stripe Connect (flagged in Phase 8)
