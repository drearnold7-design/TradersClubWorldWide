// app/api/whop/webhook/route.ts
// Whop is the source of truth for course content and access. This
// webhook keeps a thin mirror of membership status in Supabase so the
// CRM/admin dashboard and customer portal can show "has course access"
// without calling the Whop API on every page load.
//
// Corrected against Whop's actual docs (docs.whop.com/developer/guides/webhooks):
// verification method is `webhooks.unwrap(body, { headers })`, not `.verify(body, signature)`,
// and the real event names are `membership.activated` / `membership.deactivated`,
// not `membership.went_valid` / `membership.went_invalid`.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWhop } from '@/lib/whop/client';

export async function POST(request: Request) {
  // Constructed inside the handler, not at module scope, so a missing env
  // var can't crash Next.js's build-time page-data collection.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const whop = getWhop();

  const requestBodyText = await request.text();
  const headers = Object.fromEntries(request.headers);

  let webhookData: any;
  try {
    // unwrap() verifies the signature AND parses the JSON in one call —
    // it throws on a bad/missing signature, so a forged payload never
    // reaches the code below.
    webhookData = whop.webhooks.unwrap(requestBodyText, { headers });
  } catch (err) {
    console.error('Whop webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = webhookData;

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

  switch (type) {
    case 'membership.activated':
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
        metadata: { whop_event_type: type, access_pass: data.access_pass?.id },
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

    case 'membership.deactivated': {
      await supabase
        .from('whop_memberships')
        .update({ status: 'expired' })
        .eq('whop_membership_id', data.id);
      break;
    }

    default:
      // Other event types (refund.created, dispute.created, entry.created, etc.)
      // aren't acted on yet — safe to ignore rather than error.
      break;
  }

  return NextResponse.json({ received: true });
}
