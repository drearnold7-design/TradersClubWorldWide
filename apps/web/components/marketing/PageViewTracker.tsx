// components/marketing/PageViewTracker.tsx
'use client';

import { useEffect } from 'react';
import { track, captureUtmParams } from '@/lib/analytics/track';

export default function PageViewTracker() {
  useEffect(() => {
    captureUtmParams();
    track('page_view');
  }, []);

  return null;
}
