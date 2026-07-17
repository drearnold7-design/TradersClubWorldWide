// app/r/[code]/route.ts
// Handles https://tradersclubworldwide.com/r/{code} — logs the click,
// sets a cookie so the eventual signup/booking can be attributed to
// this referrer, then redirects to the main landing page.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  // Constructed inside the handler, not at module scope, so a missing env
  // var can't crash Next.js's build-time page-data collection.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const url = new URL(request.url);

  await supabase.from('referral_clicks').insert({
    referral_code: params.code,
    landing_path: url.pathname,
  });

  const response = NextResponse.redirect(new URL('/', request.url));

  // 30-day attribution window — long enough to cover a considered
  // high-ticket purchase decision, short enough to keep attribution honest
  response.cookies.set('tcw_referral_code', params.code, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: false, // needs to be readable client-side by the quiz/signup form
  });

  return response;
}
