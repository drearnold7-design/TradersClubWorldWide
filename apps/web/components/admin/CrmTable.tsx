// components/admin/CrmTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pipeline_stage: string;
  lead_source: string;
  experience_level: string;
  tags: string[];
  created_at: string;
  last_contacted_at: string | null;
};

const STAGES = [
  'new_lead', 'contacted', 'qualified', 'deposit_paid', 'balance_due',
  'paid_in_full', 'checked_in', 'trip_completed', 'course_sold', 'mentorship_sold', 'lost',
];

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CrmTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'created_at' | 'last_contacted_at'>('created_at');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from('leads').select('*').order(sortKey, { ascending: false });
    query.then(({ data }) => {
      setLeads((data as Lead[]) ?? []);
      setLoading(false);
    });
  }, [sortKey]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStage = stageFilter === 'all' || l.pipeline_stage === stageFilter;
      const haystack = `${l.first_name} ${l.last_name} ${l.email} ${l.phone}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [leads, search, stageFilter]);

  const exportCsv = () => {
    const header = 'First Name,Last Name,Email,Phone,Stage,Source,Created\n';
    const rows = filtered
      .map((l) => [l.first_name, l.last_name, l.email, l.phone, l.pipeline_stage, l.lead_source, l.created_at].join(','))
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tcw-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="all">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="created_at">Newest First</option>
          <option value="last_contacted_at">Last Contacted</option>
        </select>
        <button
          onClick={exportCsv}
          className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm text-slate-200">
          <thead className="bg-slate-900 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No leads match your filters.</td></tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                  <td className="px-4 py-3">{l.first_name} {l.last_name}</td>
                  <td className="px-4 py-3">
                    <div>{l.email}</div>
                    <div className="text-slate-500">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs capitalize">
                      {l.pipeline_stage?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{l.lead_source}</td>
                  <td className="px-4 py-3">{l.experience_level}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
