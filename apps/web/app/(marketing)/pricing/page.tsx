// app/(marketing)/pricing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/MarketingNav';

export const metadata: Metadata = {
  title: 'Pricing & Packages — Traders Club Worldwide',
  description:
    'Executive Trader Pass, Companion Pass, and the Full Training Bundle for the Trade & Travel Experience in Punta Cana, August 15–23.',
};

type Package = {
  name: string;
  price: string;
  priceNote?: string;
  tagline: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
};

const PACKAGES: Package[] = [
  {
    name: 'Companion Pass',
    price: '$2,995',
    priceNote: 'starting at',
    tagline: 'The full Executive experience, priced for your second traveler.',
    features: [
      { label: 'Full 8-day Punta Cana itinerary', included: true },
      { label: 'Luxury networking dinners', included: true },
      { label: '3 premium excursions (catamaran, dune buggy, ocean)', included: true },
      { label: 'Golden Hour Sunset Celebration + graduation dinner', included: true },
      { label: 'Live trading sessions with Daniel Gamble', included: true },
      { label: '1-on-1 mentoring & trade breakdowns', included: true },
      { label: 'Morning mindset coaching sessions', included: true },
    ],
  },
  {
    name: 'Executive Trader Pass',
    price: '$4,995',
    tagline: 'The full experience — trade live, get mentored, and travel in luxury.',
    highlight: true,
    features: [
      { label: 'Full 8-day Punta Cana itinerary', included: true },
      { label: 'Luxury networking dinners', included: true },
      { label: '3 premium excursions (catamaran, dune buggy, ocean)', included: true },
      { label: 'Golden Hour Sunset Celebration + graduation dinner', included: true },
      { label: 'Live trading sessions with Daniel Gamble', included: true },
      { label: '1-on-1 mentoring & trade breakdowns', included: true },
      { label: 'Morning mindset coaching sessions', included: true },
    ],
  },
  {
    name: 'Full Training Bundle',
    price: '$8,995',
    priceNote: 'for two',
    tagline: 'Bring a partner — both of you get the full Executive experience.',
    features: [
      { label: 'Full 8-day Punta Cana itinerary (both guests)', included: true },
      { label: 'Luxury networking dinners (both guests)', included: true },
      { label: '3 premium excursions (both guests)', included: true },
      { label: 'Golden Hour Sunset Celebration + graduation dinner', included: true },
      { label: 'Live trading sessions with Daniel Gamble (both guests)', included: true },
      { label: '1-on-1 mentoring & trade breakdowns (both guests)', included: true },
      { label: 'Morning mindset coaching sessions (both guests)', included: true },
    ],
  },
];

const maxPrice = 8995;
const priceValues = [2995, 4995, 8995];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink-900">
      <MarketingNav />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
          The Sniper Investor Executive Trading Retreat
        </p>
        <h1 className="mt-4 font-serif text-4xl text-ivory-50 md:text-6xl">
          Trade. Learn. Build relationships.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ivory-200/70">
          Eight days of luxury and professional trading education in Punta
          Cana — August 15–23. Five intensive days of live trading, mindset
          coaching, and one-on-one mentoring with Daniel Gamble, wrapped in a
          real vacation.
        </p>
      </section>

      {/* Simple price comparison bar chart */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="space-y-4 rounded-2xl border border-ivory-200/10 bg-ink-800/60 p-8">
          {PACKAGES.map((pkg, i) => (
            <div key={pkg.name}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-ivory-200/80">{pkg.name}</span>
                <span className="font-mono text-gold-400">{pkg.price}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                  style={{ width: `${(priceValues[i] / maxPrice) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Package comparison cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                pkg.highlight
                  ? 'border-gold-400/50 bg-gradient-to-b from-ink-800 to-ink-900 shadow-[0_0_60px_-15px_rgba(201,162,39,0.3)]'
                  : 'border-ivory-200/10 bg-ink-800/40'
              }`}
            >
              {pkg.highlight && (
                <span className="mb-4 w-fit rounded-full bg-gold-500 px-3 py-1 text-xs font-medium text-ink-900">
                  Most Popular
                </span>
              )}
              <h3 className="font-serif text-2xl text-ivory-50">{pkg.name}</h3>
              <p className="mt-2 text-sm text-ivory-200/60">{pkg.tagline}</p>
              <p className="mt-6">
                {pkg.priceNote && (
                  <span className="mr-1 text-xs uppercase tracking-wide text-ivory-200/50">{pkg.priceNote}</span>
                )}
                <span className="font-serif text-4xl text-ivory-50">{pkg.price}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {pkg.features.map((f) => (
                  <li key={f.label} className={`flex items-start gap-2 ${f.included ? 'text-ivory-200/90' : 'text-ivory-200/30 line-through'}`}>
                    <span className={f.included ? 'text-gold-400' : 'text-ivory-200/30'}>
                      {f.included ? '✓' : '–'}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <Link
                href="/#quiz"
                className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-medium transition ${
                  pkg.highlight
                    ? 'bg-gold-500 text-ink-900 hover:bg-gold-400'
                    : 'border border-ivory-200/20 text-ivory-50 hover:bg-ink-800'
                }`}
              >
                Apply for this package
              </Link>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-ivory-200/40">
          Deposit required to reserve. Balance due on a payment plan ahead of
          departure. Educational trading sessions only — no income or profit
          is guaranteed. Trading involves substantial risk of loss.
        </p>
      </section>

      {/* Trip overview */}
      <section className="border-t border-ivory-200/10 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
            What Every Day Looks Like
          </p>
          <h2 className="mt-4 text-center font-serif text-3xl text-ivory-50 md:text-4xl">
            Structure by day, freedom by evening.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-gold-400">Mornings</p>
              <p className="mt-2 text-ivory-200/80">
                Optional sunrise beach run and mindset reset, then live market
                sessions and hands-on workshops.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-gold-400">Afternoons</p>
              <p className="mt-2 text-ivory-200/80">
                Strategy work, one-on-one coaching with Daniel Gamble, and
                real trade breakdowns from the morning session.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-gold-400">Evenings</p>
              <p className="mt-2 text-ivory-200/80">
                Luxury networking dinners, premium excursions, and the Golden
                Hour Sunset Celebration and graduation dinner to close it out.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ivory-200/10 px-6 py-20 text-center">
        <h2 className="font-serif text-3xl text-ivory-50 md:text-4xl">
          Choose your package, then apply.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ivory-200/70">
          20 seats for the August 15–23 cohort in Punta Cana.
        </p>
        <Link
          href="/#quiz"
          className="mt-8 inline-block rounded-full bg-gold-500 px-10 py-4 font-medium text-ink-900 transition hover:bg-gold-400"
        >
          See if a seat is right for you
        </Link>
      </section>
    </main>
  );
}
