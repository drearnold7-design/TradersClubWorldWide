// apps/web/middleware.ts
// Phase 2 — Route protection by role
// Runs on every request to (portal) and (admin) route groups.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type Role = 'owner' | 'admin' | 'sales' | 'marketing' | 'support' | 'customer' | 'affiliate';

const STAFF_ROLES: Role[] = ['owner', 'admin', 'sales', 'marketing', 'support'];

// Which route prefixes require which roles.
const ROUTE_RULES: { prefix: string; allow: Role[] }[] = [
  { prefix: '/admin/crm', allow: ['owner', 'admin', 'sales', 'marketing'] },
  { prefix: '/admin/support', allow: ['owner', 'admin', 'support'] },
  { prefix: '/admin', allow: ['owner', 'admin'] },
  { prefix: '/dashboard', allow: ['customer', 'affiliate', ...STAFF_ROLES] }, // any logged-in user
  { prefix: '/trip', allow: ['customer', 'affiliate', ...STAFF_ROLES] },
  { prefix: '/courses', allow: ['customer', 'affiliate', ...STAFF_ROLES] },
  { prefix: '/referrals', allow: ['customer', 'affiliate', ...STAFF_ROLES] },
  { prefix: '/support', allow: ['customer', 'affiliate', ...STAFF_ROLES] },
  { prefix: '/profile', allow: ['customer', 'affiliate', ...STAFF_ROLES] },
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => response.cookies.set(name, value, options),
        remove: (name: string, options: CookieOptions) => response.cookies.set(name, '', { ...options, maxAge: 0 }),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const matchedRule = ROUTE_RULES.find((r) => path.startsWith(r.prefix));

  if (!matchedRule) return response; // public route, no restriction

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as Role | undefined;

  if (!role || !matchedRule.allow.includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/trip/:path*',
    '/courses/:path*',
    '/referrals/:path*',
    '/support/:path*',
    '/profile/:path*',
  ],
};
