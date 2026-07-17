// components/marketing/IntroVideo.tsx
'use client';

import Image from 'next/image';

export default function IntroVideo() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <Image
          src="/images/crest-emblem.png"
          alt="The Sniper Investor crest"
          width={140}
          height={78}
          className="mx-auto mb-6"
        />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
          Meet Daniel Gamble
        </p>
        <h2 className="mt-3 font-serif text-3xl text-ivory-50 md:text-4xl">
          Hear it from him directly.
        </h2>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-ivory-200/10 bg-ink-800/60">
        <video
          className="w-full"
          controls
          preload="metadata"
          playsInline
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
          Your browser doesn't support embedded video. You can{' '}
          <a href="/videos/intro.mp4" className="underline">
            download the video
          </a>{' '}
          instead.
        </video>
      </div>
    </section>
  );
}
