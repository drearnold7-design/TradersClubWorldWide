// app/(admin)/admin/analytics/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const supabase = createServerSupabase();

  const from = searchParams.from ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = searchParams.to ?? new Date().toISOString().slice(0, 10);

  const [
    { data: events },
    { data: bookings },
    { data: event },
  ] = await Promise.all([
    supabase.from('analytics_events').select('*').gte('created_at', from).lte('created_at', `${to}T23:59:59`),
    supabase.from('bookings').select('trip_status, created_at').gte('created_at', from).lte('created_at', `${to}T23:59:59`),
    supabase.from('events').select('capacity').eq('is_active', true).limit(1).single(),
  ]);

  const funnel = {
    websiteVisits: (events ?? []).filter((e) => e.event_name === 'page_view').length,
    quizStarted: (events ?? []).filter((e) => e.event_name === 'quiz_started').length,
    quizCompleted: (events ?? []).filter((e) => e.event_name === 'quiz_completed').length,
    leadsCaptured: (events ?? []).filter((e) => e.event_name === 'lead_captured').length,
    checkoutsStarted: (events ?? []).filter((e) => e.event_name === 'checkout_started').length,
    purchasesCompleted: (events ?? []).filter((e) => e.event_name === 'purchase_completed').length,
  };

  const campaignCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  (events ?? []).forEach((e) => {
    if (e.utm_campaign) campaignCounts[e.utm_campaign] = (campaignCounts[e.utm_campaign] ?? 0) + 1;
    if (e.utm_source) sourceCounts[e.utm_source] = (sourceCounts[e.utm_source] ?? 0) + 1;
  });
  const topCampaigns = Object.entries(campaignCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const bookedCount = (bookings ?? []).filter((b) => b.trip_status !== 'not_booked').length;
  const abandonedCount = (bookings ?? []).filter((b) => b.trip_status === 'not_booked').length;
  const roomsRemaining = event ? event.capacity - bookedCount : null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white">Analytics & Reporting</h1>

      <form className="mt-4 flex gap-3" method="get">
        <input type="date" name="from" defaultValue={from} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        <input type="date" name="to" defaultValue={to} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          Apply
        </button>
      </form>

      {/* Funnel */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Conversion Funnel</h2>
        <div className="mt-3 grid grid-cols-6 gap-3">
          {[
            { label: 'Website Visits', value: funnel.websiteVisits },
            { label: 'Quiz Started', value: funnel.quizStarted },
            { label: 'Quiz Completed', value: funnel.quizCompleted },
            { label: 'Leads Captured', value: funnel.leadsCaptured },
            { label: 'Checkouts Started', value: funnel.checkoutsStarted },
            { label: 'Purchases', value: funnel.purchasesCompleted },
          ].map((step) => (
            <div key={step.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-2xl font-semibold text-white">{step.value}</p>
              <p className="mt-1 text-xs text-slate-400">{step.label}</p>
            </div>
          ))}
        </div>
        {funnel.quizStarted > 0 && (
          <p className="mt-2 text-sm text-slate-400">
            Quiz completion rate: {((funnel.quizCompleted / funnel.quizStarted) * 100).toFixed(1)}% ·
            Lead-to-purchase: {funnel.leadsCaptured > 0 ? ((funnel.purchasesCompleted / funnel.leadsCaptured) * 100).toFixed(1) : '0.0'}%
          </p>
        )}
      </section>

      {/* Trip capacity */}
      <section className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Bookings</p>
          <p className="mt-2 text-2xl text-white">{bookedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Rooms Remaining</p>
          <p className="mt-2 text-2xl text-white">{roomsRemaining ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Abandoned Checkouts</p>
          <p className="mt-2 text-2xl text-white">{abandonedCount}</p>
        </div>
      </section>

      {/* Top campaigns/sources */}
      <section className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Top Campaigns</h2>
          <div className="mt-3 space-y-2">
            {topCampaigns.map(([name, count]) => (
              <div key={name} className="flex justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm">
                <span className="text-white">{name}</span>
                <span className="text-slate-400">{count} events</span>
              </div>
            ))}
            {topCampaigns.length === 0 && <p className="text-sm text-slate-500">No campaign data in this range.</p>}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Top Traffic Sources</h2>
          <div className="mt-3 space-y-2">
            {topSources.map(([name, count]) => (
              <div key={name} className="flex justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm">
                <span className="text-white capitalize">{name}</span>
                <span className="text-slate-400">{count} events</span>
              </div>
            ))}
            {topSources.length === 0 && <p className="text-sm text-slate-500">No source data in this range.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
