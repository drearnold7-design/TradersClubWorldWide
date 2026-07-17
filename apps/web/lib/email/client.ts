// lib/email/client.ts
import { Resend } from 'resend';

// Lazily constructed — see lib/stripe/client.ts for why this can't be a
// module-scope `new Resend(...)`.
let resendClient: Resend | undefined;

export function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY!);
  }
  return resendClient;
}
