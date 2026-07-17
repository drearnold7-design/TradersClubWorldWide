// app/(portal)/layout.tsx
import Link from 'next/link';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/trip', label: 'My Trip' },
  { href: '/courses', label: 'Courses' },
  { href: '/referrals', label: 'Referrals' },
  { href: '/support', label: 'Support' },
  { href: '/profile', label: 'Profile' },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900 text-ivory-50">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
        <nav className="w-48 shrink-0">
          <p className="mb-6 font-serif text-lg text-gold-400">Traders Club</p>
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-ivory-200/70 transition hover:bg-ink-800 hover:text-ivory-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
