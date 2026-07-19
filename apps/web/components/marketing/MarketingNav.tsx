// components/marketing/MarketingNav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/classes', label: 'Classes' },
];

export default function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ivory-200/10 bg-ink-900/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image src="/images/crest-emblem.png" alt="The Sniper Investor crest" width={32} height={18} />
          <span className="font-serif text-lg text-gold-400">Traders Club</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-ink-800 text-gold-400'
                    : 'text-ivory-200/70 hover:bg-ink-800 hover:text-ivory-50'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <a
          href="/#quiz"
          className="hidden rounded-full bg-gold-500 px-5 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-gold-400 sm:block"
        >
          Apply Now
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory-50 sm:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${open ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${open ? 'opacity-0' : ''}`} />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${open ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ivory-200/10 px-6 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm ${
                    active ? 'bg-ink-800 text-gold-400' : 'text-ivory-200/70'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            <a
              href="/#quiz"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gold-500 px-5 py-3 text-center text-sm font-medium text-ink-900"
            >
              Apply Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
