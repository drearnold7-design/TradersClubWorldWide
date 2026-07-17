// app/(admin)/admin/referrals/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Rule = {
  id: string;
  trigger_event: string;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
};

const TRIGGER_LABELS: Record<string, string> = {
  booking_deposit_paid: 'Referred customer pays deposit',
  booking_paid_in_full: 'Referred customer pays in full',
  whop_course_purchased: 'Referred customer buys a course',
};

const REWARD_TYPES = ['cash', 'trip_discount', 'course_access', 'vip_upgrade'];

export default function ReferralRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    supabase.from('referral_rules').select('*').then(({ data }) => setRules((data as Rule[]) ?? []));
  }, []);

  const updateRule = async (id: string, updates: Partial<Rule>) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    await supabase.from('referral_rules').update(updates).eq('id', id);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white">Referral Program Rules</h1>
      <p className="mt-1 text-sm text-slate-400">
        Change reward amounts and toggle rules on/off — no code changes needed, live immediately.
      </p>

      <div className="mt-6 space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex-1">
              <p className="text-sm text-white">{TRIGGER_LABELS[rule.trigger_event] ?? rule.trigger_event}</p>
            </div>
            <select
              value={rule.reward_type}
              onChange={(e) => updateRule(rule.id, { reward_type: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              {REWARD_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            <input
              type="number"
              value={rule.reward_value}
              onChange={(e) => updateRule(rule.id, { reward_value: Number(e.target.value) })}
              className="w-28 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={rule.is_active}
                onChange={(e) => updateRule(rule.id, { is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
