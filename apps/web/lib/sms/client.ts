// lib/sms/client.ts
import twilio from 'twilio';

// Lazily constructed — see lib/stripe/client.ts for why this can't be a
// module-scope twilio(...) call.
let twilioClient: ReturnType<typeof twilio> | undefined;

export function getTwilio() {
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  }
  return twilioClient;
}
