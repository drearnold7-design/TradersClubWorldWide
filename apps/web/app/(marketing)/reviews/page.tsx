// app/(marketing)/reviews/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/MarketingNav';

const SCREENSHOTS = [
  { src: '/images/reviews/june-profits-1.png', alt: 'June profits shared in our private Discord by students' },
  { src: '/images/reviews/june-profits-2.png', alt: 'June profits shared in our private Discord by students' },
  { src: '/images/reviews/june-profits-3.png', alt: 'June profits shared in our private Discord by students' },
  { src: '/images/reviews/june-profits-4.png', alt: 'June profits shared in our private Discord by students' },
  { src: '/images/reviews/june-profits-5.png', alt: 'June profits shared in our private Discord by students' },
];

const VIDEOS = [
  '/videos/reviews/student-result-1.mp4',
  '/videos/reviews/student-result-2.mp4',
  '/videos/reviews/student-result-3.mp4',
  '/videos/reviews/student-result-4.mp4',
];

export default function ReviewsPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-ink-900">
      <MarketingNav />

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
          Real Members, Real Results
        </p>
        <h1 className="mt-4 font-serif text-4xl text-ivory-50 md:text-6xl">
          Straight from our private Discord.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ivory-200/70">
          No stock footage, no scripts — this is what our students post themselves
          the moment a trade closes. Screenshots and videos, unedited.
        </p>
      </section>

      {/* Screenshot proof grid */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-ivory-200/50">
          June Profits — Shared in the Discord by Students
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SCREENSHOTS.map((shot) => (
            <button
              key={shot.src}
              onClick={() => setLightbox(shot.src)}
              className="group overflow-hidden rounded-2xl border border-ivory-200/10 bg-ink-800/60 transition hover:border-gold-400/40"
            >
              <div className="relative aspect-[9/16] w-full">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Video results */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-ivory-200/50">
          Student Trade Breakdowns
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {VIDEOS.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-2xl border border-ivory-200/10 bg-ink-800/60"
            >
              <video className="w-full" controls preload="metadata" playsInline>
                <source src={src} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ivory-200/10 px-6 py-20 text-center">
        <h2 className="font-serif text-3xl text-ivory-50 md:text-4xl">
          Your results could be next.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ivory-200/70">
          20 seats for the August 15–23 cohort in Punta Cana. See if one's
          right for you.
        </p>
        <Link
          href="/#quiz"
          className="mt-8 inline-block rounded-full bg-gold-500 px-10 py-4 font-medium text-ink-900 transition hover:bg-gold-400"
        >
          See if a seat is right for you
        </Link>
        <p className="mx-auto mt-6 max-w-xl text-xs text-ivory-200/40">
          Educational trading sessions only. Individual results shown are not
          typical and are not a guarantee of future performance. No income or
          profit is guaranteed. Trading involves substantial risk of loss.
        </p>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 text-2xl text-ivory-50"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="relative max-h-[90vh] w-full max-w-md">
            <Image
              src={lightbox}
              alt="June profits shared in our private Discord by students"
              width={1125}
              height={1946}
              className="h-auto w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}
