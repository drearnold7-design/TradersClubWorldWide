// lib/email/send.ts
import { getResend } from './client';

type Lead = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
};

export async function sendLeadConfirmationEmail(lead: Lead) {
  const resend = getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: lead.email,
    subject: 'Your Trade & Travel Experience details are on the way',
    html: `
      <p>Hi ${lead.firstName},</p>
      <p>Thanks for your interest in the Trade & Travel Experience — August 15&ndash;23, 20 seats total.</p>
      <p>We're pulling together your full trip details, pricing, and a link to reserve your seat. Keep an eye on your inbox (and texts, if you left a number) over the next little while.</p>
      <p>&mdash; Traders Club Worldwide</p>
    `,
  });
}

// Notifies the business owner/admin whenever a new lead comes in. No-op if
// ADMIN_NOTIFICATION_EMAIL isn't configured, so this never blocks lead capture.
export async function sendAdminNewLeadEmail(lead: Lead) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  const resend = getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    subject: `New lead: ${lead.firstName} ${lead.lastName ?? ''}`.trim(),
    html: `
      <p>New signup on the landing page:</p>
      <ul>
        <li><strong>Name:</strong> ${lead.firstName} ${lead.lastName ?? ''}</li>
        <li><strong>Email:</strong> ${lead.email}</li>
        <li><strong>Phone:</strong> ${lead.phone ?? 'n/a'}</li>
      </ul>
    `,
  });
}
