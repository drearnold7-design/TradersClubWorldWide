// components/marketing/ExitIntentModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('tcw_exit_shown');
    if (alreadyShown) return;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
        sessionStorage.setItem('tcw_exit_shown', '1');
      }
    };
    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, [dismissed]);

  const close = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/80 px-6 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md rounded-2xl border border-gold-400/30 bg-ink-800 p-8 text-center"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 text-ivory-200/50 hover:text-ivory-50"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
              Before you go
            </p>
            <h3 className="mt-4 font-serif text-2xl text-ivory-50">
              Only 20 seats exist for this cohort.
            </h3>
            <p className="mt-3 text-ivory-200/70">
              Take 60 seconds to see which track fits you — no commitment,
              just your personalized trip details.
            </p>
            <a
              href="#quiz"
              onClick={close}
              className="mt-6 inline-block rounded-full bg-gold-500 px-8 py-3 font-medium text-ink-900 transition hover:bg-gold-400"
            >
              Take the 60-second quiz
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
