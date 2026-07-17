// components/marketing/WhopCheckoutEmbed.tsx
'use client';

// Renders Whop's embedded checkout for a given plan. Requires the loader
// script to be included once, globally, in the root layout:
//
//   <script async defer src="https://js.whop.com/static/checkout/loader.js" />
//
// and, if a Content-Security-Policy is set on the site, allowing:
//   frame-src https://*.whop.com
//   script-src https://js.whop.com
//   connect-src https://*.whop.com

export default function WhopCheckoutEmbed({
  planId,
  returnUrl,
  prefillEmail,
  theme = 'dark',
}: {
  planId: string;
  returnUrl?: string;
  prefillEmail?: string;
  theme?: 'light' | 'dark' | 'system';
}) {
  return (
    <div
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-return-url={returnUrl}
      data-whop-checkout-theme={theme}
      data-whop-checkout-prefill-email={prefillEmail}
      style={{ height: 'fit-content', overflow: 'hidden', width: '100%', maxWidth: 480 }}
    />
  );
}
