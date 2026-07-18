// app/unauthorized/page.tsx
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-center text-ivory-50">
      <div className="max-w-sm">
        <h1 className="font-serif text-2xl">You don't have access to that page</h1>
        <p className="mt-3 text-sm text-ivory-200/70">
          Your account doesn't have the right permissions for this section. If you think that's wrong, contact whoever manages your account.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-gold-400 underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
