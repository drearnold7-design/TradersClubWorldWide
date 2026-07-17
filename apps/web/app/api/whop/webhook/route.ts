// app/api/whop/webhook/route.ts
// Whop is the source of truth for course content and access. This
// webhook keeps a thin mirror of membership status in Supabase so the
// CRM/admin dashboard and customer portal can show "has course access"
// without calling the Whop API on every page load.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { whop } from '@/lib/whop/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('whop-signature') ?? '';

  let event: any;
  try {
    // whop.webhooks.verify throws if the signature doesn't match —
    // never trust a payload that hasn't been verified against the secret
    event = whop.webhooks.verify(body, signature);
  } catch (err) {
    console.error('Whop webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { action, data } = event;

  // Match the Whop user to our profile by email. If they don't have a
  // profile yet (e.g. bought the course before ever visiting our site),
  // we still record the membership against a null profile_id and reconcile
  // it the next time they sign in with that email — handled by a lookup
  // in the signup trigger, not shown here.
  const email: string | undefined = data?.user?.email;
  let profileId: string | null = null;
  if (email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    profileId = profile?.id ?? null;
  }

  switch (action) {
    case 'membership.went_valid':
    case 'payment.succeeded': {
      await supabase.from('whop_memberships').upsert(
        {
          profile_id: profileId,
          whop_membership_id: data.id ?? data.membership?.id,
          whop_access_pass_id: data.access_pass?.id ?? data.membership?.access_pass?.id,
          whop_plan_id: data.plan?.id,
          product_name: data.access_pass?.name ?? data.plan?.access_pass?.name,
          status: 'active',
        },
        { onConflict: 'whop_membership_id' }
      );

      // Mirror into the CRM pipeline so sales/marketing see it without
      // leaving the CRM to check Whop directly
      if (profileId) {
        await supabase.from('leads').update({ pipeline_stage: 'course_sold' }).eq('profile_id', profileId);
      }

      await supabase.from('analytics_events').insert({
        event_name: 'whop_course_purchased',
        profile_id: profileId,
        metadata: { whop_action: action, access_pass: data.access_pass?.id },
      });

      // Phase 8 — award a referral reward if this customer was referred
      if (profileId) {
        await supabase.rpc('award_referral_reward', {
          p_referred_profile_id: profileId,
          p_trigger_event: 'whop_course_purchased',
          p_booking_id: null,
        });
      }
      break;
    }

    case 'membership.went_invalid': {
      await supabase
        .from('whop_memberships')
        .update({ status: 'expired' })
        .eq('whop_membership_id', data.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
