# Referral System — Phase 8

## What's built
- **`/r/[code]`** — the actual shareable link route. Logs a `referral_clicks` row, sets a 30-day `tcw_referral_code` cookie, redirects to the homepage.
- **Signup attribution** — `handle_new_user()` (updated from Phase 2) reads `referral_code_used` from signup metadata and sets `profiles.referred_by`. The signup form should read the `tcw_referral_code` cookie and pass it along — see the comment at the top of `phase8-signup-attribution.sql` for the exact call shape.
- **`referral_rules` table + admin page (`/admin/referrals`)** — this is the "no-code" config the master spec asked for. Daniel or you can change reward type/amount/on-off for each trigger event directly in the admin UI, live, no developer needed. Seeded with sensible defaults (**$250 for paid-in-full, $50 for deposit, free course access for course referrals** — change any of these anytime).
- **`award_referral_reward()` function** — called from both the Stripe webhook (Phase 5) and the Whop webhook (Phase 7) after a successful payment. Looks up the referrer, checks the active rule for that event, inserts a `pending` reward. A unique constraint prevents double-awarding if a webhook retries.
- **Leaderboard** — added to the existing `/referrals` portal page (Phase 6), ranks referrers by approved+paid reward count, top 10.

## How the whole loop works end to end
1. Customer A gets their referral link automatically on signup (Phase 2)
2. They share `tradersclubworldwide.com/r/{code}`
3. Customer B clicks it → cookie set, click logged
4. B signs up → `referred_by` set on their profile
5. B pays a deposit or buys a course → webhook fires → `award_referral_reward()` checks the active rule → creates a `pending` reward for A
6. Staff reviews pending rewards in the CRM and marks them `approved`/`paid` manually — intentionally not automatic, so a fraudulent or disputed referral never auto-pays out

## Reward payout itself
Marking a reward `paid` in the DB is a status flag — it does not itself move money. Actually paying out cash rewards needs either a manual Stripe transfer/PayPal payout by staff, or Stripe Connect if you want it automated later. Flagging this now rather than building a money-movement feature you didn't ask for and haven't confirmed the payout mechanism for.
