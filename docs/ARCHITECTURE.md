# Traders Club Worldwide — Platform Architecture
Phase 1 of 10 — Architecture & Database Design

## 1. Tech Stack (locked in)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/SEO for landing pages, file-based routing for portal + admin |
| Styling | TailwindCSS + Framer Motion | Fast, consistent design system; smooth animation without heavy libs |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) | One system for DB, auth, RLS, file storage — avoids stitching together 4 services |
| Payments | Stripe (Checkout + Billing + Connect for payment plans) | Industry standard, handles ACH/Apple Pay/Google Pay natively |
| Email | Resend | Modern deliverability, clean API, good Next.js support |
| SMS | Twilio | Already in use for the recruiting funnel — reuse existing account |
| Analytics | GA4, GTM, Meta Pixel, TikTok Pixel, MS Clarity | Standard ad-attribution stack |
| Hosting | Netlify | Matches existing infra (positionnow.netlify.app) |
| Repo | GitHub | Version control, CI/CD via Netlify build hooks |

## 2. System Diagram (logical)

```
[Ad Platforms] → [Landing Page] → [Quiz] → [Lead Capture]
                                                  ↓
                                          [Supabase: leads table]
                                                  ↓
                              [Automation: Resend + Twilio sequences]
                                                  ↓
                                          [Booking Page] → [Stripe Checkout]
                                                  ↓
                                       [Supabase: bookings + payments]
                                                  ↓
                              [Customer Portal]  ←→  [Admin Dashboard / CRM]
                                                  ↓
                                    [Course Platform] → [Referral Engine]
```

Everything reads/writes to one Supabase project. One users table. One source of truth. This is what makes "future expansion" (more events, memberships, other businesses) possible without a rebuild.

## 3. Repo / Folder Structure

```
tcw-platform/
├── apps/
│   └── web/                        # Next.js app (single deploy target)
│       ├── app/
│       │   ├── (marketing)/        # public landing pages
│       │   │   ├── page.tsx        # home / main landing
│       │   │   ├── quiz/
│       │   │   ├── book/
│       │   │   └── layout.tsx
│       │   ├── (portal)/           # customer-only, auth required
│       │   │   ├── dashboard/
│       │   │   ├── trip/
│       │   │   ├── courses/
│       │   │   ├── referrals/
│       │   │   └── layout.tsx
│       │   ├── (admin)/            # role-gated staff area
│       │   │   ├── crm/
│       │   │   ├── pipeline/
│       │   │   ├── analytics/
│       │   │   ├── settings/
│       │   │   └── layout.tsx
│       │   ├── api/                # route handlers (webhooks, server actions)
│       │   │   ├── stripe/webhook/
│       │   │   ├── leads/
│       │   │   └── referrals/
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/                 # buttons, cards, inputs (design system)
│       │   ├── marketing/
│       │   ├── portal/
│       │   └── admin/
│       ├── lib/
│       │   ├── supabase/           # client + server clients
│       │   ├── stripe/
│       │   ├── email/
│       │   ├── sms/
│       │   └── analytics/
│       └── middleware.ts           # role-based route protection
├── supabase/
│   ├── schema.sql
│   ├── policies.sql
│   └── seed.sql
└── docs/
    ├── ARCHITECTURE.md
    ├── ERD.md
    └── (populated as each phase completes)
```

## 4. Phase Roadmap (confirming order)

1. ✅ Architecture & database design — **this document + schema**
2. Authentication & user roles
3. Landing page + marketing site
4. CRM + admin dashboard
5. Payments & checkout
6. Customer portal
7. Course platform
8. Referral system
9. Analytics & reporting
10. Testing, optimization, deployment

Each phase builds strictly on the schema below — this is why it comes first.
