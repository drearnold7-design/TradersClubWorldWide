// app/(admin)/admin/content-ideas/page.tsx
'use client';

import { useState } from 'react';

type Category = {
  title: string;
  description: string;
  captions: string[];
};

const CATEGORIES: Category[] = [
  {
    title: 'Urgency & Scarcity',
    description: 'Only 20 seats exist — lean into that hard, especially close to the deposit deadline.',
    captions: [
      "20 seats. That's it. That's the whole cohort. Link in bio before they're gone.",
      "We're not padding the room to sell more seats. 20 people, one trip, real access to Daniel. First come, first seated.",
      "Reminder: seats don't hold themselves. Deposit locks yours in — full balance due before we land in Punta Cana.",
      "If you've been \"thinking about it\" for a week, that's your sign. Seats are going.",
      "Last cohort filled in [X] days. This one's moving faster.",
    ],
  },
  {
    title: 'Educational / Authority',
    description: "Give away a real, useful nugget — builds trust before anyone ever takes the quiz.",
    captions: [
      "Most new traders lose money the same way: no plan for when they're wrong, only a plan for when they're right. We fix that first.",
      "The market doesn't care about your opinion. It only cares about your risk management. Day 1 material, every cohort.",
      "You don't need to predict the market. You need a system that survives being wrong 40% of the time and still prints. That's what live trading week is for.",
      "Quick tip: if you can't explain your trade thesis in one sentence, you don't have a thesis — you have a hope.",
      "This is the exact chart pattern we broke down live last cohort. [attach chart] Swipe for the full breakdown.",
    ],
  },
  {
    title: 'Social Proof',
    description: "Real names, real numbers, real reactions do more than any ad copy. Ask attendees for a quote or a 15-second video the day after a session.",
    captions: [
      "\"I've read four trading books. I learned more in 3 hours live with Daniel than in all four combined.\" — [Name], Cohort [X]",
      "Real seat, real reaction. [Name] just watched Daniel call a setup live and land it in real time. This is why we do it live.",
      "Not a testimonial we paid for — a text [Name] sent us the day after check-out. Screenshot below.",
      "20 people flew in not knowing each other. By day 3 they were trading each other's setups in the group chat. That's the actual product.",
    ],
  },
  {
    title: 'Behind-the-Scenes / Lifestyle',
    description: "Punta Cana is part of the pitch. Show it — the room, the view, the group, not just slides.",
    captions: [
      "Trading floor by day, this view by evening. Punta Cana, August 15–23.",
      "This is what \"live trading session\" actually looks like — not a webinar, a room.",
      "Behind the scenes setting up for Cohort [X]. 8 days, 20 seats, one villa.",
      "The whiteboard after today's session. Yes, we clean it before dinner.",
    ],
  },
  {
    title: 'Engagement / Questions',
    description: "Comment-bait that's still on-brand — use these to warm up an audience before a launch push.",
    captions: [
      "Beginner, intermediate, or 'I've lost money and I'm still here'? Drop it below.",
      "What's the #1 thing stopping you from trading live right now — knowledge, capital, or confidence? Be honest.",
      "If you had 8 days with a trader who's actually done it, what's the first question you'd ask?",
      "Tag someone who keeps saying 'I'll start trading next year.'",
    ],
  },
  {
    title: 'Countdown / Announcement',
    description: "Use these as the deposit deadline or departure date approaches.",
    captions: [
      "30 days out. [X] seats left.",
      "One week left to lock in a deposit for August 15–23. After that, it's next cohort or nothing.",
      "We land in Punta Cana in [X] days. Last chance to be in that room.",
      "Doors close Friday. Full trip details are one quiz away — link in bio.",
    ],
  },
];

const GENERAL_TIPS = [
  "Post the quiz link (or a direct hook to it) at least once a day during an active launch window — it's the lowest-friction next step for anyone who's curious.",
  "Video outperforms static images for this kind of offer — even a 15-second phone clip of Daniel explaining one concept beats a polished graphic.",
  "Reuse attendee reactions relentlessly. One good testimonial clip can be cut into 4-5 different captions/angles over a few weeks.",
  "Pin your best-performing post to the top of each platform during the 2 weeks before a deposit deadline.",
  "Stories/reels showing the actual room, whiteboard, or trade calls build more trust than any sales copy — \"show the work\" beats \"describe the work.\"",
];

export default function ContentIdeasPage() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white">Content Ideas</h1>
      <p className="mt-1 text-sm text-slate-400">
        Ready-to-use caption ideas and posting tips for The Sniper Investor / Traders Club Worldwide. Click any caption to copy it.
      </p>

      <div className="mt-8 space-y-8">
        {CATEGORIES.map((cat) => (
          <section key={cat.title}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{cat.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{cat.description}</p>
            <div className="mt-3 space-y-2">
              {cat.captions.map((caption, i) => {
                const key = `${cat.title}-${i}`;
                return (
                  <button
                    key={key}
                    onClick={() => copy(caption, key)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-emerald-600/50 hover:bg-slate-900/80"
                  >
                    {caption}
                    <span className="ml-2 text-xs text-emerald-500">
                      {copiedIndex === key ? 'Copied ✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">General Tips</h2>
          <ul className="mt-3 space-y-2">
            {GENERAL_TIPS.map((tip) => (
              <li key={tip} className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
