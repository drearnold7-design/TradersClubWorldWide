// app/api/leads/route.ts
// Receives quiz + contact form submissions from the landing page.
// Writes to Supabase `leads` table, fires analytics event, sends the lead a
// confirmation email/SMS, and notifies the admin of the new signup.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendLeadConfirmationEmail, sendAdminNewLeadEmail } from '@/lib/email/send';
import { sendLeadConfirmationSms, sendAdminNewLeadSms } from '@/lib/sms/send';

export async function POST(request: Request) {
  // Service-role client — bypasses RLS deliberately, since anonymous
  // visitors have no auth session yet but must be able to create a lead.
  // Constructed inside the handler, not at module scope, so a missing env
  // var can't crash Next.js's build-time page-data collection.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await request.json();

  const {
    firstName,
    lastName,
    email,
    phone,
    city,
    state,
    consent,
    quiz_answers,
    experience_level,
  } = body;

  if (!email || !phone || !firstName) {
    return NextResponse.json(
      { error: 'Missing required fields.' },
      { status: 400 }
    );
  }

  // Pull UTM params if the frontend forwarded them (captured client-side on landing)
  const utm = body.utm ?? {};

  const { data, error } = await supabase
    .from('leads')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      city,
      state,
      marketing_consent: !!consent,
      quiz_answers,
      experience_level,
      lead_source: utm.utm_source ?? 'direct',
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      pipeline_stage: 'new_lead',
    })
    .select()
    .single();

  if (error) {
    console.error('Lead insert failed:', error.message);
    return NextResponse.json({ error: 'Could not save lead.' }, { status: 500 });
  }

  // Fire-and-forget analytics event
  await supabase.from('analytics_events').insert({
    event_name: 'lead_captured',
    utm_source: utm.utm_source,
    utm_campaign: utm.utm_campaign,
    metadata: { lead_id: data.id },
  });

  // Confirmation email/SMS to the lead, plus an admin notification.
  // Each is independent — one provider failing (e.g. no Resend/Twilio key
  // configured yet) shouldn't take down the others or fail the signup,
  // since the lead is already saved at this point.
  const notifications = await Promise.allSettled([
    sendLeadConfirmationEmail({ firstName, lastName, email, phone }),
    sendLeadConfirmationSms({ firstName, phone }),
    sendAdminNewLeadEmail({ firstName, lastName, email, phone }),
    sendAdminNewLeadSms({ firstName, lastName }),
  ]);
  notifications.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('Lead notification failed:', result.reason);
    }
  });

  return NextResponse.json({ success: true, leadId: data.id });
}
