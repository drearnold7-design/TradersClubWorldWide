// app/(portal)/support/page.tsx
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('support_tickets').insert({
      profile_id: user?.id,
      subject,
      message,
      status: 'open',
    });
    setSent(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div>
      <h1 className="font-serif text-3xl">Support</h1>
      <p className="mt-1 text-ivory-200/70">
        Questions about your trip, payment, or account — we'll respond within 24 hours.
      </p>

      {sent ? (
        <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-400">
          Your message has been sent. We'll follow up by email shortly.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40"
          />
          <textarea
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40"
          />
          <button
            onClick={submit}
            disabled={!subject || !message}
            className="rounded-full bg-gold-500 px-8 py-3 font-medium text-ink-900 hover:bg-gold-400 disabled:opacity-50"
          >
            Send Message
          </button>
        </div>
      )}
    </div>
  );
}
