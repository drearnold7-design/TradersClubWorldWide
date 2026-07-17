// app/(portal)/trip/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import PackingChecklist from '@/components/portal/PackingChecklist';

const SCHEDULE = [
  { day: 'Day 1 · Aug 15', title: 'Arrival & Welcome Dinner', detail: 'Check-in, orientation, welcome dinner with Daniel and the group.' },
  { day: 'Day 2 · Aug 16', title: 'Live Trading Session I + Market Fundamentals', detail: 'Morning live session, afternoon excursion.' },
  { day: 'Day 3 · Aug 17', title: 'Strategy Workshop', detail: 'Deep-dive workshop, free afternoon.' },
  { day: 'Day 4 · Aug 18', title: 'Live Trading Session II', detail: 'Live session, group networking dinner.' },
  { day: 'Day 5 · Aug 19', title: 'Excursion Day', detail: 'Full-day excursion, evening free.' },
  { day: 'Day 6 · Aug 20', title: 'Live Trading Session III', detail: 'Live session, nightlife evening.' },
  { day: 'Day 7 · Aug 21', title: 'Q&A with Daniel + Wrap Workshop', detail: 'Open Q&A, final strategy workshop.' },
  { day: 'Day 8 · Aug 22–23', title: 'Closing Dinner & Departure', detail: 'Closing dinner, checkout and departures.' },
];

export default async function TripPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(*)')
    .eq('profile_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('profile_id', user?.id)
    .order('created_at', { ascending: false });

  if (!booking) {
    return <p className="text-ivory-200/70">No trip booked yet.</p>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl">{booking.events?.name}</h1>
        <p className="mt-1 text-ivory-200/70">
          {new Date(booking.events?.start_date).toLocaleDateString()} –{' '}
          {new Date(booking.events?.end_date).toLocaleDateString()} ·{' '}
          {booking.events?.location ?? 'Location sent 30 days before departure'}
        </p>
      </div>

      <section>
        <h2 className="mb-4 font-serif text-xl text-gold-400">Schedule</h2>
        <div className="space-y-3">
          {SCHEDULE.map((item) => (
            <div key={item.day} className="rounded-xl border border-ivory-200/10 bg-ink-800/40 p-4">
              <p className="text-xs uppercase tracking-wide text-ivory-200/50">{item.day}</p>
              <p className="mt-1 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-ivory-200/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl text-gold-400">Packing Checklist</h2>
        <PackingChecklist />
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl text-gold-400">Receipts</h2>
        <div className="divide-y divide-ivory-200/10 rounded-xl border border-ivory-200/10">
          {(payments ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
              <span>${Number(p.amount).toLocaleString()}</span>
              <span className="capitalize text-ivory-200/60">{p.status}</span>
            </div>
          ))}
          {(!payments || payments.length === 0) && (
            <p className="px-4 py-3 text-sm text-ivory-200/50">No payments yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
