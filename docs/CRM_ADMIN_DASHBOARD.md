# CRM & Admin Dashboard — Phase 4

## What's built
- **Dashboard widgets** (`DashboardWidgets.tsx`) — live-queried from Supabase: new leads today, revenue today/month, outstanding balances, bookings count, conversion rate, open support tickets
- **CRM table** (`CrmTable.tsx`) — full leads list with search (name/email/phone), stage filter, sort by newest/last-contacted, and CSV export
- **Pipeline board** (`PipelineBoard.tsx`) — drag-and-drop kanban across all 10 pipeline stages using `@hello-pangea/dnd` (the actively-maintained fork of react-beautiful-dnd), backed by the API route so every stage change is persisted and audited
- **`/api/leads/[id]`** — GET for lead detail, PATCH for updates (stage, notes, tags, assigned salesperson) — every PATCH writes an `audit_logs` row automatically

## Widgets deferred to Phase 9 (Analytics)
Visitors today/this week, top campaign, top traffic source, top performing ads, abandoned checkouts, and room-capacity-remaining widgets need the GA4/pixel event stream and the `events.capacity` vs. bookings math wired up together — that's the analytics phase, so they're not duplicated here. Flagging now so they aren't dropped.

## New dependency
Add to `package.json`:
```
"@hello-pangea/dnd": "^16.6.0"
```

## Role gating
This entire route group (`app/(admin)/*`) is already protected by the Phase 2 middleware — `sales`/`marketing`/`admin`/`owner` get in, `support` gets read-only per the RLS policy on `leads`, `customer`/`affiliate` are redirected to `/unauthorized`.
