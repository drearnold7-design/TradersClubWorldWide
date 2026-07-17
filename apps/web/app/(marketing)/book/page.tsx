// app/(marketing)/book/page.tsx
'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics/track';

export default function BookPage() {
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    track('checkout_started', { payment_type: paymentType });
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: process.env.NEXT_PUBLIC_CURRENT_EVENT_ID,
          profileId: '__CURRENT_USER_ID__', // populated from auth session at render time
          paymentType,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-ink-900 px-6 py-24 text-ivory-50">
      <h1 className="font-serif text-3xl">Reserve your seat</h1>
      <p className="mt-2 text-ivory-200/70">
        Trade & Travel Experience · August 15–23 · 20 seats total
      </p>

      <div className="mt-8 space-y-3">
        <button
          onClick={() => setPaymentType('deposit')}
          className={`w-full rounded-xl border px-5 py-4 text-left transition ${
            paymentType === 'deposit'
              ? 'border-gold-400 bg-gold-500/10'
              : 'border-ivory-200/15 bg-ink-800/40'
          }`}
        >
          <p className="font-medium">Pay Deposit</p>
          <p className="text-sm text-ivory-200/60">
            Reserve your seat now, remaining balance due on a payment plan.
          </p>
        </button>
        <button
          onClick={() => setPaymentType('full')}
          className={`w-full rounded-xl border px-5 py-4 text-left transition ${
            paymentType === 'full'
              ? 'border-gold-400 bg-gold-500/10'
              : 'border-ivory-200/15 bg-ink-800/40'
          }`}
        >
          <p className="font-medium">Pay In Full</p>
          <p className="text-sm text-ivory-200/60">One payment, nothing else due.</p>
        </button>
      </div>

      <div className="mt-6">
        <label className="text-sm text-ivory-200/60">Coupon code (optional)</label>
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="e.g. VIP2026"
          className="mt-1 w-full rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-8 w-full rounded-full bg-gold-500 px-8 py-4 font-medium text-ink-900 transition hover:bg-gold-400 disabled:opacity-60"
      >
        {loading ? 'Redirecting to secure checkout…' : 'Continue to Secure Checkout'}
      </button>

      <p className="mt-4 text-center text-xs text-ivory-200/40">
        Payments processed securely by Stripe. Trading involves risk; no
        profit is guaranteed.
      </p>
    </main>
  );
}
