// lib/whop/client.ts
import { Whop } from '@whop/sdk';

// Lazily constructed — see lib/stripe/client.ts for why this can't be a
// module-scope `new Whop(...)`.
let whopClient: Whop | undefined;

export function getWhop(): Whop {
  if (!whopClient) {
    whopClient = new Whop({
      apiKey: process.env.WHOP_API_KEY!,
      webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET ?? ''),
    });
  }
  return whopClient;
}
