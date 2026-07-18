// lib/sms/send.ts
import { getTwilio } from './client';

// Twilio requires E.164 (e.g. +15551234567). The lead form just collects a
// free-text phone number, so normalize plain 10-digit US numbers here —
// anything else (already has a country code, or isn't a valid length) is
// passed through as-is / rejected by Twilio if it's genuinely malformed.
function toE164(phone: string): string {
  if (phone.startsWith('+')) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone;
}

export async function sendLeadConfirmationSms(lead: { firstName: string; phone: string }) {
  const client = getTwilio();
  await client.messages.create({
    body: `Hi ${lead.firstName}, thanks for your interest in the Trade & Travel Experience! Full trip details and pricing are on the way to your email.`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: toE164(lead.phone),
  });
}

// Notifies the business owner/admin by text whenever a new lead comes in.
// Sends to both ADMIN_NOTIFICATION_PHONE and ADMIN_NOTIFICATION_PHONE_2 --
// either (or both) can be left unset with no error, just skipped.
export async function sendAdminNewLeadSms(lead: { firstName: string; lastName?: string }) {
  const adminPhones = [process.env.ADMIN_NOTIFICATION_PHONE, process.env.ADMIN_NOTIFICATION_PHONE_2].filter(
    (phone): phone is string => Boolean(phone)
  );
  if (adminPhones.length === 0) return;

  const client = getTwilio();
  const body = `New lead: ${lead.firstName} ${lead.lastName ?? ''}`.trim();

  await Promise.all(
    adminPhones.map((phone) =>
      client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: toE164(phone),
      })
    )
  );
}
