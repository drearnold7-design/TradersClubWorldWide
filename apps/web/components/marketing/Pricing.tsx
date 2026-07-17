// components/marketing/Pricing.tsx
'use client';

export default function Pricing() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="rounded-3xl border border-gold-400/20 bg-gradient-to-b from-ink-800 to-ink-900 p-10 text-center md:p-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
          Trade & Travel Experience · Aug 15–23
        </p>
        <h2 className="mt-4 font-serif text-4xl text-ivory-50 md:text-5xl">
          Twenty seats. One cohort.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ivory-200/70">
          Full pricing and payment plan options are sent after your quiz
          results — this keeps the group intentional rather than
          first-come-first-served.
        </p>
        <a
          href="#quiz"
          className="mt-8 inline-block rounded-full bg-gold-500 px-10 py-4 font-medium text-ink-900 transition hover:bg-gold-400"
        >
          Check seat availability
        </a>
        <p className="mt-6 text-xs text-ivory-200/40">
          Deposit required to reserve. Balance due on a payment plan ahead of
          departure. Trading involves risk; no profit is guaranteed.
        </p>
      </div>
    </section>
  );
}
