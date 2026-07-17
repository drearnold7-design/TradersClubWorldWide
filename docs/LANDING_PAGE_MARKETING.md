# Landing Page & Marketing — Phase 3

## Design direction (kept consistent with the approved Phase 1 landing page)
Dark ink-navy background (`#0B1120`), gold accent (`#C9A227`) for every CTA, emerald as a secondary accent, `Fraunces` serif for headlines (warm/editorial, not the generic AI-default Playfair), `Inter` for body copy, `JetBrains Mono` for eyebrows/countdown/data. This matches the aesthetic direction already locked in for Traders Club Worldwide — no rebrand, just rebuilt inside the Next.js architecture so it can talk to the CRM/quiz/checkout system.

## What's built this phase
- `Hero.tsx` — headline, countdown, primary CTA, required risk disclaimer
- `CountdownTimer.tsx` — live countdown to Aug 15
- `Quiz.tsx` — the 4-question interactive quiz → personalized message → contact form → confirmation, fully wired to `/api/leads`
- `FAQ.tsx` — accordion, compliance-safe answers (no guaranteed-income language anywhere)
- `Pricing.tsx` — intentionally withholds exact price until after the quiz (increases quiz completion, standard high-ticket funnel practice)
- `StickyCTA.tsx` — appears after 800px scroll
- `ExitIntentModal.tsx` — fires once per session on exit-intent, not repeatedly (avoids annoying returning visitors)
- `app/api/leads/route.ts` — API route that writes quiz submissions straight into the `leads` table from Phase 1, tags UTM data, fires an analytics event
- `tailwind.config.ts` — the locked design tokens

**Not rebuilt here on purpose:** "Meet Daniel Gamble," testimonials, and full benefits sections need real bio copy, photos, and testimonial content that I don't have and won't fabricate (quotes attributed to Daniel or real attendees would need to be genuine). Same component pattern as Hero/FAQ — send me the real bio/testimonial content and I'll drop them in immediately.

## Compliance notes baked in
- No "guaranteed income" or "guaranteed profit" language anywhere in copy
- Risk disclaimer in the hero and footer
- FAQ explicitly states trading involves risk and sessions are educational

## SEO
- Page-level `metadata` export (title, description, Open Graph) in `page.tsx`
- Recommend adding: `sitemap.xml` and `robots.txt` (Next.js auto-generates these from `app/sitemap.ts` / `app/robots.ts` — trivial to add once the domain is live)
- Structured data (Event schema.org markup) should be added once the exact venue/location is finalized for public disclosure

## Analytics wiring (GA4/GTM/Meta/TikTok pixels)
Pixels get loaded via `next/script` in the root layout, not in individual components — this is a Phase 9 (analytics) task so it's done once, consistently, rather than scattered per-component. Flagging now so it's not forgotten.
