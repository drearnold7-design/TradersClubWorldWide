// components/marketing/Quiz.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '@/lib/analytics/track';

type QuizAnswers = {
  experience?: string;
  motivation?: string;
  investingRange?: string;
  wantsLive?: string;
  packageInterest?: string;
  readiness?: string;
};

type LeadForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  consent: boolean;
};

const QUESTIONS = [
  {
    key: 'experience' as const,
    question: 'Have you traded before?',
    options: ['Never', 'Beginner', 'Intermediate', 'Experienced'],
  },
  {
    key: 'motivation' as const,
    question: 'Why are you interested?',
    options: ['Learn Trading', 'Financial Freedom', 'Travel', 'Networking'],
  },
  {
    key: 'investingRange' as const,
    question: 'How much investing experience do you have?',
    options: ['None', 'Under $500', '$500–$5,000', 'Over $5,000'],
  },
  {
    key: 'wantsLive' as const,
    question: 'Want to learn directly from an experienced trader, live?',
    options: ['Yes', 'Absolutely'],
  },
  {
    key: 'packageInterest' as const,
    question: 'Which package interests you most?',
    options: [
      'Executive Trader Pass — $4,995',
      'Companion Pass (add-on for a second person) — $1,500',
      'Full Training Bundle (bring a partner) — $8,995',
      'Not sure yet',
    ],
  },
  {
    key: 'readiness' as const,
    question: 'How ready are you to reserve your seat?',
    options: ['Ready to book now', 'Within the next 2 weeks', 'Just exploring for now'],
  },
];

export default function Quiz() {
  const [step, setStep] = useState(0); // 0..5 = questions, 6 = personalized msg, 7 = form, 8 = done
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [form, setForm] = useState<LeadForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    track('quiz_started');
  }, []);

  const answerQuestion = (key: keyof QuizAnswers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  };

  const submitLead = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quiz_answers: answers,
          experience_level: answers.experience,
        }),
      });
      track('quiz_completed', { experience: answers.experience });
      track('lead_captured', { experience_level: answers.experience });
      setStep(8);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.min(step, 6) / 6;

  return (
    <section id="quiz" className="mx-auto max-w-2xl px-6 py-24">
      <div className="rounded-2xl border border-ivory-200/10 bg-ink-800/60 p-8 backdrop-blur-sm md:p-12">
        {step < 7 && (
          <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-ivory-200/10">
            <motion.div
              className="h-full bg-gold-500"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step < 6 && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-serif text-2xl text-ivory-50 md:text-3xl">
                {QUESTIONS[step].question}
              </h3>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => answerQuestion(QUESTIONS[step].key, opt)}
                    className="rounded-xl border border-ivory-200/15 bg-ink-900/40 px-5 py-4 text-left text-ivory-100 transition hover:border-gold-400/60 hover:bg-gold-500/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="personalized"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h3 className="font-serif text-2xl text-ivory-50 md:text-3xl">
                Based on your answers, this cohort fits you well.
              </h3>
              <p className="mt-3 text-ivory-200/70">
                Enter your info and we'll send full trip details, pricing, and
                next steps for the {answers.packageInterest ?? 'right'} package.
              </p>
              <button
                onClick={() => setStep(7)}
                className="mt-8 rounded-full bg-gold-500 px-8 py-3 font-medium text-ink-900 transition hover:bg-gold-400"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 7 && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={(e) => {
                e.preventDefault();
                submitLead();
              }}
              className="grid gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
                />
                <input
                  required
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
              />
              <input
                required
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
                />
              </div>
              <label className="mt-2 flex items-start gap-3 text-sm text-ivory-200/70">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-1"
                />
                I agree to receive emails and texts about the Trade & Travel
                Experience. Msg & data rates may apply.
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-gold-500 px-8 py-4 font-medium text-ink-900 transition hover:bg-gold-400 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Get My Trip Details'}
              </button>
            </motion.form>
          )}

          {step === 8 && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h3 className="font-serif text-2xl text-ivory-50">
                Check your inbox and texts.
              </h3>
              <p className="mt-3 text-ivory-200/70">
                Full trip details, pricing, and a link to reserve your seat
                are on the way. Only {`20`} seats exist for this cohort.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
