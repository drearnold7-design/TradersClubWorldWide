// components/marketing/CountdownTimer.tsx
'use client';

import { useEffect, useState } from 'react';

function getTimeLeft(targetDate: string) {
  const total = new Date(targetDate).getTime() - Date.now();
  const clamped = Math.max(total, 0);
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
    expired: total <= 0,
  };
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.expired) {
    return (
      <span className="text-sm text-ivory-200/70">
        Registration for this cohort has closed.
      </span>
    );
  }

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hrs', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Sec', value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="font-mono text-2xl tabular-nums text-ivory-50">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-ivory-200/50">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
