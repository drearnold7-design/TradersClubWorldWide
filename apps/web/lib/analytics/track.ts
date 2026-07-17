// lib/analytics/track.ts
// Single function to fire an event everywhere it needs to go: our own
// `analytics_events` table (for the admin dashboard/funnel), plus GA4,
// Meta Pixel, and TikTok Pixel. Call this instead of hitting each
// platform's SDK directly so events never drift out of sync across tools.

import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, data?: Record<string, any>) => void };
  }
}

type TrackedEvent =
  | 'quiz_started'
  | 'quiz_completed'
  | 'lead_captured'
  | 'checkout_started'
  | 'purchase_completed'
  | 'referral_link_clicked';

function getUtmFromStorage() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem('tcw_utm') ?? '{}');
  } catch {
    return {};
  }
}

export function track(eventName: TrackedEvent, metadata: Record<string, any> = {}) {
  const utm = getUtmFromStorage();

  // 1. Our own event log — powers the admin funnel/campaign reports
  supabase.from('analytics_events').insert({
    event_name: eventName,
    utm_source: utm.utm_source,
    utm_campaign: utm.utm_campaign,
    metadata,
  });

  // 2. GA4
  window.gtag?.('event', eventName, metadata);

  // 3. Meta Pixel — map our event names to Meta's standard events where one exists
  const metaEventMap: Partial<Record<TrackedEvent, string>> = {
    lead_captured: 'Lead',
    checkout_started: 'InitiateCheckout',
    purchase_completed: 'Purchase',
  };
  if (metaEventMap[eventName]) {
    window.fbq?.('track', metaEventMap[eventName]!, metadata);
  }

  // 4. TikTok Pixel
  const tiktokEventMap: Partial<Record<TrackedEvent, string>> = {
    lead_captured: 'SubmitForm',
    checkout_started: 'InitiateCheckout',
    purchase_completed: 'CompletePayment',
  };
  if (tiktokEventMap[eventName]) {
    window.ttq?.track(tiktokEventMap[eventName]!, metadata);
  }
}

// Call once on landing, from a page-level effect, to capture UTM params
// into sessionStorage so every subsequent event in the session can be
// attributed correctly even after the visitor navigates away from the
// original landing URL.
export function captureUtmParams() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };
  if (Object.values(utm).some(Boolean)) {
    sessionStorage.setItem('tcw_utm', JSON.stringify(utm));
  }
}
