// lib/stripe/client.ts
import Stripe from 'stripe';

// Lazily constructed — a module-scope `new Stripe(...)` runs during
// Next.js's build-time page-data collection, so a missing env var at
// build time would crash the entire site build instead of just this route.
let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }
  return stripeClient;
}
