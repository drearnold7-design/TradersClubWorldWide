// components/admin/CrmTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type QuizAnswers = {
  experience?: string;
  motivation?: string;
  investingRange?: string;
  wantsLive?: string;
};

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  pipeline_stage: string;
  lead_source: string;
  experience_level: string;
  quiz_answers: QuizAnswers | null;
  marketing_consent: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referral_code_used: string | null;
  tags: string[];
  notes: string | null;
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

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export default function CrmTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'created_at' | 'last_contacted_at'>('created_at');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
    const header = [
      'First Name', 'Last Name', 'Email', 'Phone', 'City', 'State',
      'Stage', 'Source', 'Experience Level',
      'Quiz: Traded Before', 'Quiz: Motivation', 'Quiz: Investing Range', 'Quiz: Wants Live',
      'Marketing Consent', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
      'Referral Code Used', 'Tags', 'Notes', 'Created', 'Last Contacted',
    ].join(',') + '\n';

    const rows = filtered
      .map((l) =>
        [
          l.first_name, l.last_name, l.email, l.phone, l.city, l.state,
          l.pipeline_stage, l.lead_source, l.experience_level,
          l.quiz_answers?.experience, l.quiz_answers?.motivation, l.quiz_answers?.investingRange, l.quiz_answers?.wantsLive,
          l.marketing_consent ? 'yes' : 'no',
          l.utm_source, l.utm_medium, l.utm_campaign, l.utm_content, l.utm_term,
          l.referral_code_used, (l.tags ?? []).join('; '), l.notes,
          l.created_at, l.last_contacted_at,
        ]
          .map(csvEscape)
          .join(',')
      )
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
          Export to Excel (CSV)
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
                <tr
                  key={l.id}
                  onClick={() => setSelectedLead(l)}
                  className="cursor-pointer border-t border-slate-800 hover:bg-slate-900/50"
                >
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

      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-white">
                {selectedLead.first_name} {selectedLead.last_name}
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Email" value={selectedLead.email} />
              <Detail label="Phone" value={selectedLead.phone} />
              <Detail label="Location" value={[selectedLead.city, selectedLead.state].filter(Boolean).join(', ') || '—'} />
              <Detail label="Stage" value={selectedLead.pipeline_stage?.replace(/_/g, ' ')} />
              <Detail label="Lead Source" value={selectedLead.lead_source} />
              <Detail label="Experience Level" value={selectedLead.experience_level} />

              <div className="border-t border-slate-800 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz Answers</p>
                <Detail label="Traded before?" value={selectedLead.quiz_answers?.experience} />
                <Detail label="Motivation" value={selectedLead.quiz_answers?.motivation} />
                <Detail label="Investing range" value={selectedLead.quiz_answers?.investingRange} />
                <Detail label="Wants live?" value={selectedLead.quiz_answers?.wantsLive} />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Attribution</p>
                <Detail label="Marketing consent" value={selectedLead.marketing_consent ? 'Yes' : 'No'} />
                <Detail label="UTM Source" value={selectedLead.utm_source} />
                <Detail label="UTM Medium" value={selectedLead.utm_medium} />
                <Detail label="UTM Campaign" value={selectedLead.utm_campaign} />
                <Detail label="UTM Content" value={selectedLead.utm_content} />
                <Detail label="UTM Term" value={selectedLead.utm_term} />
                <Detail label="Referral code used" value={selectedLead.referral_code_used} />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <Detail label="Tags" value={(selectedLead.tags ?? []).join(', ') || '—'} />
                <Detail label="Notes" value={selectedLead.notes || '—'} />
                <Detail label="Created" value={new Date(selectedLead.created_at).toLocaleString()} />
                <Detail
                  label="Last Contacted"
                  value={selectedLead.last_contacted_at ? new Date(selectedLead.last_contacted_at).toLocaleString() : '—'}
                />
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-200">{value || '—'}</dd>
    </div>
  );
}
