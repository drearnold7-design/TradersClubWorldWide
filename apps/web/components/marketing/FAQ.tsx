// components/marketing/FAQ.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'Do I need trading experience to attend?',
    a: 'No. The quiz places you on the right track — beginners get foundational sessions, experienced traders go deeper into strategy. Everyone trades alongside Daniel regardless of level.',
  },
  {
    q: 'Is any income or profit guaranteed?',
    a: 'No. Live trading sessions are for educational purposes only. Trading involves risk, including the risk of loss. No specific outcome, income, or profit is promised or implied.',
  },
  {
    q: "What's included in the price?",
    a: 'Luxury housing for all 8 days, daily breakfast, excursions, nightlife, live trading sessions, trading education, networking events, and direct access to Daniel Gamble throughout the trip.',
  },
  {
    q: 'How many seats are available?',
    a: 'This cohort is capped at 20 attendees so the experience stays personal — small enough for real access to Daniel, not a conference crowd.',
  },
  {
    q: 'Can I pay in installments?',
    a: 'Yes. A deposit reserves your seat, with the balance due on a payment plan ahead of the August 15 start date. Details are sent after you complete the quiz.',
  },
  {
    q: 'What if I need to cancel?',
    a: "Refund and transfer policy details are provided in your booking confirmation. Reach out to our support team directly for your specific situation.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
        Questions
      </p>
      <h2 className="mt-4 font-serif text-4xl text-ivory-50">
        Before you reserve a seat
      </h2>

      <div className="mt-10 divide-y divide-ivory-200/10 border-y border-ivory-200/10">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={open}
              >
                <span className="pr-8 text-lg text-ivory-100">{item.q}</span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-gold-400 transition-transform ${
                    open ? 'rotate-45' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-ivory-200/70">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
