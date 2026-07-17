// components/marketing/StickyCTA.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-ivory-200/10 bg-ink-900/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <p className="hidden text-sm text-ivory-200/70 sm:block">
              20 seats · Aug 15–23 · Deposit secures your spot
            </p>
            <a
              href="#quiz"
              className="ml-auto rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink-900 transition hover:bg-gold-400"
            >
              See if a seat is right for you
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
