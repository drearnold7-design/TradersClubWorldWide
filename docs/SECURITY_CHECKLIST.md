# Security Checklist — Phase 10

## Already built in (not a to-do, just confirming coverage)
- [x] Row Level Security enabled on every table, from the first migration (Phase 1) — no table was ever exposed unprotected
- [x] Role-based access control — 7 roles, enforced at both middleware (Phase 2) and RLS (Phase 2) layers
- [x] Audit logging on every lead update (Phase 4) via `audit_logs`
- [x] Webhook signature verification on both Stripe (Phase 5) and Whop (Phase 7) — forged webhook payloads are rejected before touching the database
- [x] Service-role Supabase key used only server-side, in webhook/API routes — never shipped to the browser
- [x] Coupon/referral duplicate-award prevention via unique constraints (Phase 5/8)
- [x] Security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) set site-wide in `netlify.toml`

## To configure (account-level settings, not code)
- [ ] **2FA** — enable in Supabase Auth settings, require for `owner`/`admin` roles at minimum
- [ ] **Rate limiting** — Netlify Edge/Supabase both support this at the infra level; set request-per-minute limits on `/api/leads` and `/api/stripe/checkout` specifically since they're unauthenticated and could be spammed
- [ ] **CAPTCHA** — add to the quiz's final lead-capture step and `/book` if bot submissions become a problem (hCaptcha or Cloudflare Turnstile both integrate cleanly with Next.js server actions)
- [ ] **Daily backups** — enabled by default on Supabase's paid tiers; confirm your plan includes point-in-time recovery given this handles real payment/PII data
- [ ] **Secrets rotation** — rotate `STRIPE_WEBHOOK_SECRET`/`WHOP_WEBHOOK_SECRET`/`SUPABASE_SERVICE_ROLE_KEY` if they're ever exposed (committed to git, shared in plaintext, etc.) — treat this as a "when," not "if," policy

## OWASP-aligned notes
- SQL injection: not applicable in the traditional sense — all queries go through Supabase's client library (parameterized) or RLS-gated RPC functions, never raw string-concatenated SQL
- XSS: React escapes by default; the one place raw HTML could enter is the CMS/blog content (Phase 3's "editable everything" goal) — if you add rich-text CMS fields later, sanitize with a library like `sanitize-html` before rendering
- CSRF: Next.js API routes should validate `Origin`/`Referer` headers on state-changing requests, or rely on Supabase Auth's cookie-based session (already SameSite-protected by default)
- Broken access control: covered by the two-layer middleware+RLS model from Phase 2 — this is the single most important item on this list, and it's the one already fully built
