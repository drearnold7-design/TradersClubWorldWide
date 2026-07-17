// app/api/stripe/checkout/route.ts
// Creates a Stripe Checkout Session for either a deposit or full payment
// on a specific event. A `bookings` row is created in `not_booked` state
// BEFORE redirecting to Stripe, so we always have a record to reconcile
// against even if the customer abandons checkout (this is how "abandoned
// checkout" tracking/recovery emails become possible later).

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe/client';

export async function POST(request: Request) {
  // Constructed inside the handler, not at module scope, so a missing env
  // var can't crash Next.js's build-time page-data collection.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const stripe = getStripe();

  const { eventId, profileId, paymentType, couponCode } = await request.json();
  // paymentType: 'deposit' | 'full'

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  // Check capacity before allowing a new booking
  const { count: existingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .neq('trip_status', 'cancelled');

  if ((existingBookings ?? 0) >= event.capacity) {
    return NextResponse.json({ error: 'This event is at capacity.' }, { status: 409 });
  }

  // Validate coupon if provided
  let discountPercent = 0;
  let discountFixed = 0;
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single();

    if (coupon && (!coupon.max_uses || coupon.times_used < coupon.max_uses)) {
      if (coupon.discount_type === 'percent') discountPercent = coupon.discount_value;
      else discountFixed = coupon.discount_value;
    }
  }

  let amount = paymentType === 'deposit' ? event.deposit_amount : event.base_price;
  if (discountPercent) amount = amount * (1 - discountPercent / 100);
  if (discountFixed) amount = Math.max(amount - discountFixed, 0);

  // Create (or reuse) the booking row first
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      event_id: eventId,
      profile_id: profileId,
      total_price: event.base_price,
      amount_paid: 0,
      trip_status: 'not_booked',
      coupon_code: couponCode || null,
    })
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'us_bank_account'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.name} — ${paymentType === 'deposit' ? 'Deposit' : 'Full Payment'}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      booking_id: booking.id,
      event_id: eventId,
      profile_id: profileId,
      payment_type: paymentType,
      is_deposit: String(paymentType === 'deposit'),
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/trip?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book?cancelled=true`,
  });

  return NextResponse.json({ url: session.url });
}
