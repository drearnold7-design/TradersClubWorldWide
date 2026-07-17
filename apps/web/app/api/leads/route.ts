// app/api/leads/route.ts
// Receives quiz + contact form submissions from the landing page.
// Writes to Supabase `leads` table, fires analytics event, and
// (Phase 9 wiring) triggers the lead confirmation email/SMS.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasses RLS deliberately, since anonymous
// visitors have no auth session yet but must be able to create a lead.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
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

  // Phase 9 will call the email/SMS automation service here:
  // await sendLeadConfirmation(data);

  return NextResponse.json({ success: true, leadId: data.id });
}
