// app/(admin)/layout.tsx
import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // On the admin subdomain, middleware already rewrites "/crm" -> "/admin/crm"
  // transparently, so nav links can stay short there instead of showing a
  // redundant "/admin" in a URL that's already on the admin subdomain.
  const host = headers().get('host') ?? '';
  const isAdminHost = host.startsWith('admin.') || host.startsWith('admin-');
  const base = isAdminHost ? '' : '/admin';

  const NAV = [
    { href: base || '/', label: 'Dashboard' },
    { href: `${base}/crm`, label: 'CRM' },
    { href: `${base}/pipeline`, label: 'Pipeline' },
    { href: `${base}/analytics`, label: 'Analytics' },
    { href: `${base}/referrals`, label: 'Referrals' },
    { href: `${base}/content-ideas`, label: 'Content Ideas' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
        <nav className="w-48 shrink-0">
          <div className="mb-6 flex items-center gap-2">
            <Image
              src="/images/crest-emblem.png"
              alt="The Sniper Investor crest"
              width={28}
              height={16}
            />
            <p className="text-sm font-semibold text-white">Admin</p>
          </div>
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
