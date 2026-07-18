// app/(admin)/layout.tsx
import Link from 'next/link';
import Image from 'next/image';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/crm', label: 'CRM' },
  { href: '/admin/pipeline', label: 'Pipeline' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/referrals', label: 'Referrals' },
  { href: '/admin/content-ideas', label: 'Content Ideas' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
