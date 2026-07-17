// components/portal/PackingChecklist.tsx
'use client';

import { useState } from 'react';

const DEFAULT_ITEMS = [
  'Passport / government ID',
  'Travel insurance confirmation',
  'Laptop + charger (for live trading sessions)',
  'Business casual outfit (welcome dinner)',
  'Swimwear',
  'Comfortable walking shoes',
  'Phone charger + portable battery',
  'Sunscreen',
  'Light jacket (evenings)',
  'Any daily medications',
];

export default function PackingChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (item: string) => setChecked((c) => ({ ...c, [item]: !c[item] }));
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <p className="mb-3 text-sm text-ivory-200/60">
        {completedCount} of {DEFAULT_ITEMS.length} packed
      </p>
      <ul className="space-y-2">
        {DEFAULT_ITEMS.map((item) => (
          <li key={item}>
            <label className="flex items-center gap-3 rounded-lg border border-ivory-200/10 bg-ink-900/40 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!checked[item]}
                onChange={() => toggle(item)}
                className="h-4 w-4"
              />
              <span className={checked[item] ? 'text-ivory-200/40 line-through' : 'text-ivory-100'}>
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
