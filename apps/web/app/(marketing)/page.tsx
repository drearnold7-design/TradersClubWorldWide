// app/(marketing)/page.tsx
import type { Metadata } from 'next';
import Hero from '@/components/marketing/Hero';
import Quiz from '@/components/marketing/Quiz';
import FAQ from '@/components/marketing/FAQ';
import Pricing from '@/components/marketing/Pricing';
import StickyCTA from '@/components/marketing/StickyCTA';
import ExitIntentModal from '@/components/marketing/ExitIntentModal';

export const metadata: Metadata = {
  title: 'Trade & Travel Experience — Traders Club Worldwide',
  description:
    '8 days of live trading education and a luxury travel experience with Daniel Gamble. August 15–23. 20 seats.',
  openGraph: {
    title: 'Trade & Travel Experience — Traders Club Worldwide',
    description:
      '8 days of live trading education and a luxury travel experience with Daniel Gamble. August 15–23. 20 seats.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <main className="bg-ink-900">
      <Hero />

      {/* Meet Daniel Gamble, benefits, differentiators, testimonials sections
          follow the same component pattern as Hero/FAQ/Pricing above —
          omitted here for length, built the same way with real bio/copy
          once approved assets are provided. */}

      <Quiz />
      <Pricing />
      <FAQ />

      <footer className="border-t border-ivory-200/10 px-6 py-12 text-center text-xs text-ivory-200/40">
        <p className="mx-auto max-w-2xl">
          Traders Club Worldwide provides trading education for informational
          purposes only. Nothing on this site is financial advice. Trading
          financial markets involves substantial risk of loss and is not
          suitable for every investor. Past performance is not indicative of
          future results. No specific income or profit is guaranteed.
        </p>
        <p className="mt-4">© 2026 Traders Club Worldwide. All rights reserved.</p>
      </footer>

      <StickyCTA />
      <ExitIntentModal />
    </main>
  );
}
