// components/admin/DashboardWidgets.tsx
import { createServerSupabase } from '@/lib/supabase/server';

async function getDashboardStats() {
  const supabase = createServerSupabase();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    { count: newLeadsToday },
    { count: totalLeads },
    { data: paymentsToday },
    { data: paymentsMonth },
    { data: bookings },
    { count: openTickets },
    { count: totalWebsiteVisits },
    { count: websiteVisitsToday },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'succeeded').gte('created_at', startOfToday.toISOString()),
    supabase.from('payments').select('amount').eq('status', 'succeeded').gte('created_at', startOfMonth.toISOString()),
    supabase.from('bookings').select('trip_status, balance_due'),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'page_view'),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'page_view').gte('created_at', startOfToday.toISOString()),
  ]);

  const revenueToday = (paymentsToday ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const revenueMonth = (paymentsMonth ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const outstandingBalance = (bookings ?? []).reduce((sum, b) => sum + Number(b.balance_due), 0);
  const bookingsCount = (bookings ?? []).filter((b) => b.trip_status !== 'not_booked').length;

  const conversionRate = totalLeads ? ((bookingsCount / totalLeads) * 100).toFixed(1) : '0.0';

  return {
    newLeadsToday: newLeadsToday ?? 0,
    revenueToday,
    revenueMonth,
    outstandingBalance,
    bookingsCount,
    conversionRate,
    openTickets: openTickets ?? 0,
    totalWebsiteVisits: totalWebsiteVisits ?? 0,
    websiteVisitsToday: websiteVisitsToday ?? 0,
  };
}

export default async function DashboardWidgets() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Website Visits (Total)', value: stats.totalWebsiteVisits },
    { label: 'Website Visits Today', value: stats.websiteVisitsToday },
    { label: 'New Leads Today', value: stats.newLeadsToday },
    { label: 'Revenue Today', value: `$${stats.revenueToday.toLocaleString()}` },
    { label: 'Revenue This Month', value: `$${stats.revenueMonth.toLocaleString()}` },
    { label: 'Outstanding Balances', value: `$${stats.outstandingBalance.toLocaleString()}` },
    { label: 'Bookings', value: stats.bookingsCount },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%` },
    { label: 'Open Support Tickets', value: stats.openTickets },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">{c.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
