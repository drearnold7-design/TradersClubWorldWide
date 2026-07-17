// components/marketing/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-ink-900">
      {/* Ambient gold glow, not a full gradient background — restraint is the point */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full bg-gold-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-5%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[160px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-32 pb-20 md:grid-cols-[1.2fr_0.8fr] md:pt-40">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400"
          >
            20 Seats · August 15–23 · Location Revealed Upon Deposit
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 max-w-4xl font-serif text-5xl leading-[1.05] text-ivory-50 md:text-7xl"
          >
            Trade beside Daniel Gamble.
            <br />
            <span className="text-gold-400">Then go live like it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-ivory-200/80"
          >
            Eight days of live trading sessions, real market strategy, and a
            curated luxury experience — capped at twenty traders so every seat
            is a conversation, not a crowd.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
          >
            <a
              href="#quiz"
              className="rounded-full bg-gold-500 px-8 py-4 font-medium text-ink-900 transition hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
            >
              See if a seat is right for you
            </a>
            <CountdownTimer targetDate="2026-08-15T00:00:00" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 text-xs text-ivory-200/50"
          >
            Educational trading sessions only. No income or profit is
            guaranteed. See full risk disclosure below.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md md:max-w-none"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gold-500/10 blur-[100px]" />
          <Image
            src="/images/sniper-investor-crest.png"
            alt="The Sniper Investor crest — take the guesswork out of your investing"
            width={1200}
            height={924}
            priority
            className="w-full drop-shadow-[0_0_40px_rgba(201,162,39,0.25)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
