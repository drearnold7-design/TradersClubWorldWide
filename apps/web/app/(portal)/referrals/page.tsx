// app/(portal)/referrals/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';

export default async function ReferralsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user?.id)
    .single();

  const code = profile?.referral_code ?? '';

  const [{ count: clicks }, { data: rewards }] = await Promise.all([
    supabase.from('referral_clicks').select('*', { count: 'exact', head: true }).eq('referral_code', code),
    supabase.from('referral_rewards').select('*').eq('referrer_id', user?.id),
  ]);

  const pending = (rewards ?? []).filter((r) => r.status === 'pending');
  const paid = (rewards ?? []).filter((r) => r.status === 'paid');
  const pendingTotal = pending.reduce((sum, r) => sum + Number(r.reward_value ?? 0), 0);
  const paidTotal = paid.reduce((sum, r) => sum + Number(r.reward_value ?? 0), 0);

  return (
    <div>
      <h1 className="font-serif text-3xl">Referral Dashboard</h1>

      <div className="mt-6 rounded-2xl border border-gold-400/20 bg-ink-800/60 p-6">
        <p className="text-sm text-ivory-200/60">Your link</p>
        <p className="mt-1 font-mono text-lg text-gold-400">
          tradersclubworldwide.com/r/{code}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Clicks', value: clicks ?? 0 },
          { label: 'Purchases', value: paid.length + pending.length },
          { label: 'Pending Rewards', value: `$${pendingTotal.toLocaleString()}` },
          { label: 'Paid Rewards', value: `$${paidTotal.toLocaleString()}` },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-ivory-200/10 bg-ink-800/40 p-5">
            <p className="text-xs uppercase tracking-wide text-ivory-200/50">{c.label}</p>
            <p className="mt-2 text-2xl text-ivory-50">{c.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-ivory-200/50">
        Reward payouts are reviewed and approved manually before being marked
        paid — this keeps the referral program accurate and prevents
        duplicate or fraudulent claims.
      </p>

      <Leaderboard />
    </div>
  );
}

async function Leaderboard() {
  const supabase = createServerSupabase();

  // Aggregate approved+paid reward counts per referrer, top 10
  const { data } = await supabase
    .from('referral_rewards')
    .select('referrer_id, profiles!referral_rewards_referrer_id_fkey(first_name, last_name)')
    .in('status', ['approved', 'paid']);

  const counts: Record<string, { name: string; count: number }> = {};
  (data ?? []).forEach((r: any) => {
    const name = `${r.profiles?.first_name ?? 'Anonymous'} ${r.profiles?.last_name?.[0] ?? ''}.`;
    if (!counts[r.referrer_id]) counts[r.referrer_id] = { name, count: 0 };
    counts[r.referrer_id].count += 1;
  });

  const top = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="mt-10">
      <h2 className="font-serif text-xl text-gold-400">Leaderboard</h2>
      <div className="mt-4 divide-y divide-ivory-200/10 rounded-xl border border-ivory-200/10">
        {top.length === 0 && (
          <p className="px-4 py-3 text-sm text-ivory-200/50">No referrals yet — be the first!</p>
        )}
        {top.map((entry, i) => (
          <div key={entry.name + i} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-ivory-100">#{i + 1} {entry.name}</span>
            <span className="text-gold-400">{entry.count} referral{entry.count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
