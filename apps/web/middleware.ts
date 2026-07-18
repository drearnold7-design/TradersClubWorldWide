// apps/web/middleware.ts
// Phase 2 — Route protection by role
// Runs on every request to (portal) and (admin) route groups.
//
// /admin is reachable directly on the main site (protected by the role
// check below, same as everything else here) -- that's the simple path.
// If a separate admin.<domain> subdomain, or a second admin-* Netlify
// site, ever gets set up on top of this, requests to that host
// transparently rewrite to /admin so nothing else has to change.

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

// Paths that should never be rewritten, on either domain.
const PASSTHROUGH_PREFIXES = ['/api', '/_next', '/login', '/unauthorized', '/r/'];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const isAdminHost = hostname.startsWith('admin.') || hostname.startsWith('admin-');
  const originalPath = request.nextUrl.pathname;
  const isPassthrough = PASSTHROUGH_PREFIXES.some((p) => originalPath.startsWith(p));

  // On the admin subdomain, every path is transparently rewritten under
  // /admin so visitors never type "/admin" themselves.
  let rewrittenUrl: URL | null = null;
  if (isAdminHost && !isPassthrough && !originalPath.startsWith('/admin')) {
    rewrittenUrl = request.nextUrl.clone();
    rewrittenUrl.pathname = `/admin${originalPath === '/' ? '' : originalPath}`;
  }

  const path = rewrittenUrl?.pathname ?? originalPath;
  const response = rewrittenUrl ? NextResponse.rewrite(rewrittenUrl) : NextResponse.next();

  // Most requests (marketing pages, webhooks, static-ish routes) hit no
  // rule at all -- skip the Supabase round-trip entirely for those instead
  // of auth-checking every single page load now that the matcher is broad.
  const matchedRule = ROUTE_RULES.find((r) => path.startsWith(r.prefix));
  if (!matchedRule) return response;

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|videos/).*)'],
};
