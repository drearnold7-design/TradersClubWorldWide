# Performance Optimization Plan — Phase 10

## Already in place by construction
- Server Components by default (dashboard widgets, trip page, CRM page all fetch data server-side — no client-side loading spinner waterfalls)
- Next.js automatic code-splitting per route group — the admin dashboard's JS never ships to a visitor on the public landing page
- Framer Motion animations are scoped to individual components, not a single monolithic animation library load

## To do before launch
- [ ] **Images**: replace any placeholder `<img>` tags with `next/image` once real photography is provided — gets automatic responsive sizing, lazy loading, and WebP conversion for free
- [ ] **Fonts**: load `Fraunces`/`Inter`/`JetBrains Mono` (Phase 3 tokens) via `next/font` rather than a `<link>` tag — eliminates render-blocking font requests and layout shift
- [ ] **Third-party scripts**: all analytics/pixel scripts (Phase 9) already use `strategy="afterInteractive"` so they don't block the initial page render — confirm this holds once real GA4/Meta/TikTok IDs are added
- [ ] **Database indexes**: already added on the hot query paths (`leads.pipeline_stage`, `leads.email`, `leads.created_at`, `bookings.event_id`, `bookings.profile_id`, `analytics_events.event_name`, `analytics_events.created_at`) — revisit with Supabase's query performance dashboard once real traffic exists, don't guess at more indexes before that
- [ ] **Edge caching**: the landing page (`/`) and `/book` are strong candidates for Netlify's edge/CDN caching since they're mostly static per-visitor; the admin dashboard and portal pages should NOT be cached (they're personalized/live data) — Next.js's default `no-store` for dynamic data fetches already handles this correctly, just don't override it

## Lighthouse targets
Aim for 90+ on Performance/Accessibility/Best Practices/SEO for the public landing page specifically — that's the page ad spend drives traffic to, so it's the one where load time directly affects cost-per-lead. The admin/portal pages behind auth don't need the same bar; they're internal tools, not ad-traffic destinations.
