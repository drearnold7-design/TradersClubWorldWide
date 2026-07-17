// app/(portal)/dashboard/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PortalDashboard() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, referral_code')
    .eq('id', user?.id)
    .single();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(name, start_date, end_date)')
    .eq('profile_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div>
      <h1 className="font-serif text-3xl">
        Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
      </h1>

      {booking ? (
        <div className="mt-6 rounded-2xl border border-gold-400/20 bg-ink-800/60 p-6">
          <p className="text-sm text-ivory-200/60">Your trip</p>
          <p className="mt-1 font-serif text-2xl">{booking.events?.name}</p>
          <p className="mt-1 text-ivory-200/70">
            {new Date(booking.events?.start_date).toLocaleDateString()} –{' '}
            {new Date(booking.events?.end_date).toLocaleDateString()}
          </p>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-ivory-200/50">Paid</p>
              <p className="text-lg text-ivory-50">${Number(booking.amount_paid).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-ivory-200/50">Balance Due</p>
              <p className="text-lg text-ivory-50">${Number(booking.balance_due).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-ivory-200/50">Status</p>
              <p className="text-lg capitalize text-gold-400">{booking.trip_status?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <Link
            href="/trip"
            className="mt-6 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink-900 hover:bg-gold-400"
          >
            View Trip Details
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ivory-200/10 bg-ink-800/40 p-6 text-ivory-200/70">
          You haven't reserved a seat yet.{' '}
          <Link href="/book" className="text-gold-400 underline">
            Reserve now
          </Link>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-ivory-200/10 bg-ink-800/40 p-6">
        <p className="text-sm text-ivory-200/60">Your referral link</p>
        <p className="mt-1 font-mono text-gold-400">
          tradersclubworldwide.com/r/{profile?.referral_code}
        </p>
        <Link href="/referrals" className="mt-3 inline-block text-sm text-ivory-200/70 underline">
          View referral dashboard →
        </Link>
      </div>
    </div>
  );
}
