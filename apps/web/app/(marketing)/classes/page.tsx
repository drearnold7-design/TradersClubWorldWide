// app/(marketing)/classes/page.tsx
import type { Metadata } from 'next';
import MarketingNav from '@/components/marketing/MarketingNav';
import PageViewTracker from '@/components/marketing/PageViewTracker';

export const metadata: Metadata = {
  title: 'Classes & Discord Access — Traders Club Worldwide',
  description:
    'Live trading room Discord access, the Technical Analysis 5 Day Class, and the Options Mastery & TA 10 Day Class.',
};

type Feature = { label: string; included: boolean };

type ClassOption = {
  name: string;
  price: string;
  priceNote: string;
  highlight?: boolean;
  features: Feature[];
  financing?: string;
  freeTrial?: string;
  fineprint: string;
  signupUrl: string;
};

const CLASSES: ClassOption[] = [
  {
    name: 'Discord Access (Live Trading Room)',
    price: '$18',
    priceNote: '/weekly',
    features: [
      { label: 'TA Introduction Masterclass for beginners', included: true },
      { label: 'Stock Options Masterclass for beginners', included: true },
      { label: 'Pre-market News, Mon–Thurs 9am–11am', included: true },
      { label: 'Live voice trading with real-time trade calls', included: true },
      { label: 'Sniper Investor Tool Kit', included: true },
      { label: 'Weekly Discord Access', included: true },
      { label: 'Technical Analysis 5 Day Class', included: false },
      { label: 'Trade & Travel Events', included: false },
    ],
    freeTrial: 'Free Trial: Immediate Access.',
    fineprint:
      'No further payments are required. Additionally, this payment can be credited towards the Full 5 Day Class.',
    signupUrl: 'https://whop.com/checkout/plan_3kFV7PeekWD4g?d2c=true',
  },
  {
    name: 'Technical Analysis 5 Day Class',
    price: '$3,995',
    priceNote: '/accelerator program',
    highlight: true,
    features: [
      { label: 'Technical Analysis 5 Day Class', included: true },
      { label: 'Trend Analysis Mastery', included: true },
      { label: 'Real-time Chart Exercises', included: true },
      { label: 'Live Trading Insights', included: true },
      { label: '6 Weeks of Additional Coaching', included: true },
      { label: 'Two One-on-One Assessments', included: true },
      { label: '6 Week Discord Access', included: true },
    ],
    financing: 'Financing Available: Klarna.',
    fineprint:
      'Access details delivered instantly via email after payment. Includes courses, live trading floor, tools, and software recommendations.',
    signupUrl: 'https://buy.stripe.com/00waEZ8cM43uc3D7BL3Je05',
  },
  {
    name: 'Options Mastery & TA 10 Day Class',
    price: '$7,000',
    priceNote: '/one payment',
    features: [
      { label: 'Option Strategies 5 Day Class', included: true },
      { label: 'Technical Analysis 5 Day Class', included: true },
      { label: 'Volatility Analysis', included: true },
      { label: 'Real-time Chart Exercises', included: true },
      { label: 'Live Trading Insights', included: true },
      { label: '12 Weeks of Additional Coaching', included: true },
      { label: 'Two One-on-One Assessments', included: true },
      { label: '12 Week Discord Access', included: true },
    ],
    financing: 'Financing Available: Klarna.',
    fineprint:
      'Access details delivered instantly via email after payment. Includes courses, live trading floor, tools, and software recommendations.',
    signupUrl: 'https://buy.stripe.com/8x28wRfFe1VmebLe093Je0a',
  },
];

export default function ClassesPage() {
  return (
    <main className="min-h-screen bg-ink-900">
      <PageViewTracker />
      <MarketingNav />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
          Trading Education
        </p>
        <h1 className="mt-4 font-serif text-4xl text-ivory-50 md:text-6xl">
          Classes & Live Trading Room
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ivory-200/70">
          These are for the ongoing trading education — separate from the
          Trade & Travel Experience in Punta Cana. Start in the Discord room
          for $18/week, or go deep with a full accelerator program.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CLASSES.map((c) => (
            <div
              key={c.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                c.highlight
                  ? 'border-gold-400/50 bg-gradient-to-b from-ink-800 to-ink-900 shadow-[0_0_60px_-15px_rgba(201,162,39,0.3)]'
                  : 'border-ivory-200/10 bg-ink-800/40'
              }`}
            >
              {c.highlight && (
                <span className="mb-4 w-fit rounded-full bg-gold-500 px-3 py-1 text-xs font-medium text-ink-900">
                  Most Popular
                </span>
              )}
              <h3 className="font-serif text-xl text-ivory-50 md:text-2xl">{c.name}</h3>

              <p className="mt-6">
                <span className="font-serif text-4xl text-ivory-50">{c.price}</span>
                <span className="ml-1 text-sm text-ivory-200/50">{c.priceNote}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {c.features.map((f) => (
                  <li
                    key={f.label}
                    className={`flex items-start gap-2 ${
                      f.included ? 'text-ivory-200/90' : 'text-ivory-200/30 line-through'
                    }`}
                  >
                    <span className={f.included ? 'text-gold-400' : 'text-ivory-200/30'}>
                      {f.included ? '✓' : '–'}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              {c.freeTrial && (
                <p className="mt-6 text-sm font-medium text-emerald-400">{c.freeTrial}</p>
              )}
              {c.financing && (
                <p className="mt-6 text-sm font-medium text-emerald-400">{c.financing}</p>
              )}

              <a
                href={c.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 block rounded-full px-6 py-3 text-center text-sm font-medium transition ${
                  c.highlight
                    ? 'bg-gold-500 text-ink-900 hover:bg-gold-400'
                    : 'border border-ivory-200/20 text-ivory-50 hover:bg-ink-800'
                }`}
              >
                Sign Up
              </a>

              <p className="mt-4 text-xs text-ivory-200/40">{c.fineprint}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-ivory-200/40">
          Educational trading sessions only. Nothing here is financial advice.
          Trading involves substantial risk of loss and is not suitable for
          every investor. No income or profit is guaranteed.
        </p>
      </section>
    </main>
  );
}
