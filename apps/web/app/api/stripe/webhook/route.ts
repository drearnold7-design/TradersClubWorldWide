// app/api/stripe/webhook/route.ts
// Single source of truth for payment state. Never trust the client to
// tell us a payment succeeded — only this webhook, verified against
// Stripe's signature, is allowed to mark a payment/booking as paid.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/client';
import type Stripe from 'stripe';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { booking_id, profile_id, is_deposit } = session.metadata!;
      const amountPaid = (session.amount_total ?? 0) / 100;

      // Record the payment
      await supabase.from('payments').insert({
        booking_id,
        profile_id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: amountPaid,
        status: 'succeeded',
        payment_method: session.payment_method_types?.[0] ?? 'card',
        is_deposit: is_deposit === 'true',
        receipt_url: session.invoice ? undefined : undefined, // Stripe receipt fetched separately if needed
      });

      // Analytics — completes the funnel started in the Quiz/booking flow
      await supabase.from('analytics_events').insert({
        event_name: 'purchase_completed',
        profile_id,
        metadata: { amount: amountPaid, payment_type: is_deposit === 'true' ? 'deposit' : 'full' },
      });

      // Update the booking's amount_paid and trip_status
      const { data: booking } = await supabase
        .from('bookings')
        .select('amount_paid, total_price')
        .eq('id', booking_id)
        .single();

      if (booking) {
        const newAmountPaid = Number(booking.amount_paid) + amountPaid;
        const newStatus = newAmountPaid >= Number(booking.total_price) ? 'paid_in_full' : 'deposit_paid';

        await supabase
          .from('bookings')
          .update({ amount_paid: newAmountPaid, trip_status: newStatus })
          .eq('id', booking_id);

        // Mirror the booking status into the CRM pipeline for this customer's lead, if linked
        await supabase
          .from('leads')
          .update({ pipeline_stage: newStatus === 'paid_in_full' ? 'paid_in_full' : 'deposit_paid' })
          .eq('profile_id', profile_id);
      }

      // Increment coupon usage if one was applied
      const { data: bookingWithCoupon } = await supabase
        .from('bookings')
        .select('coupon_code')
        .eq('id', booking_id)
        .single();

      if (bookingWithCoupon?.coupon_code) {
        await supabase.rpc('increment_coupon_usage', { p_code: bookingWithCoupon.coupon_code });
      }

      // Award a referral reward to whoever referred this customer, if anyone did
      // (Phase 8 — no-op if referred_by is null or no active rule matches)
      if (booking) {
        const finalStatus = Number(booking.amount_paid) + amountPaid >= Number(booking.total_price)
          ? 'booking_paid_in_full'
          : 'booking_deposit_paid';
        await supabase.rpc('award_referral_reward', {
          p_referred_profile_id: profile_id,
          p_trigger_event: finalStatus,
          p_booking_id: booking_id,
        });
      }

      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent_id', charge.payment_intent as string);
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', intent.id);
      break;
    }

    default:
      // Unhandled event types are fine to ignore — Stripe sends many we don't act on
      break;
  }

  return NextResponse.json({ received: true });
}
