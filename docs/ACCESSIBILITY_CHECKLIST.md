# Accessibility Checklist — Phase 10

## Already handled in the components built
- [x] Visible keyboard focus states (`focus-visible:outline`) on all interactive elements — Hero CTA, quiz options, form inputs, FAQ accordion
- [x] `aria-live="polite"` on the countdown timer so screen readers announce updates without interrupting
- [x] `aria-expanded` on the FAQ accordion buttons
- [x] `aria-label` on icon-only buttons (exit-intent modal close button)
- [x] Semantic HTML — `<nav>`, `<main>`, `<footer>`, real `<button>`/`<label>`/`<input>` elements throughout, not clickable `<div>`s

## To verify before launch (needs a real browser + screen reader, not just code review)
- [ ] Run the landing page and `/book` through VoiceOver (Mac) or NVDA (Windows) — confirm the quiz flow is fully navigable by keyboard alone, including the multi-step transitions
- [ ] Color contrast: the gold-on-ink-navy CTA (`#C9A227` on `#0B1120`) should be checked against WCAG AA (4.5:1 for body text, 3:1 for large text) — verify with a contrast checker once final colors are locked, since gold-on-dark can sometimes fall short for smaller text sizes
- [ ] `prefers-reduced-motion`: Framer Motion respects this automatically when `useReducedMotion()` is wired in — not yet added to the Hero/Quiz animations, worth adding given how animation-heavy the landing page is
- [ ] Form validation errors (currently browser-native `required` attributes) should have visible, programmatically-associated error text once you're ready to move past native HTML5 validation
- [ ] Video player (if you add captions/transcripts for course content — though that's now on Whop's side per the Phase 7 rebuild, so this applies to any video Daniel embeds directly on the marketing site)

## Standard to hold
WCAG 2.1 AA is the reasonable bar for a commercial site handling payments — not just "doesn't technically fail an automated scanner," but genuinely usable by someone navigating with a keyboard or screen reader.
