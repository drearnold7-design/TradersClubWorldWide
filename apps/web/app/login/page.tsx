// app/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // On the admin subdomain, "/" rewrites to the admin home in middleware;
  // everywhere else, logged-in users land in the customer portal.
  const isAdminHost = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
  const redirectTo = searchParams.get('redirect') || (isAdminHost ? '/' : '/dashboard');

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'signIn') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // If email confirmation is required, there's no session yet -- tell them to check their inbox.
      if (!data.session) {
        setCheckEmail(true);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    }
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-ivory-50">
        <div className="max-w-sm text-center">
          <h1 className="font-serif text-2xl">Check your email</h1>
          <p className="mt-3 text-sm text-ivory-200/70">
            We sent a confirmation link to <span className="text-ivory-50">{email}</span>. Click it, then come back and sign in.
          </p>
          <button
            onClick={() => {
              setCheckEmail(false);
              setMode('signIn');
            }}
            className="mt-6 text-sm text-gold-400 underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-ivory-50">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-lg text-gold-400">Traders Club</p>
        <h1 className="mt-2 text-center font-serif text-2xl">
          {mode === 'signIn' ? 'Sign in to your account' : 'Create your account'}
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === 'signUp' && (
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-ivory-200/15 bg-ink-800/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
              />
              <input
                required
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg border border-ivory-200/15 bg-ink-800/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
              />
            </div>
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ivory-200/15 bg-ink-800/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
          />
          <input
            required
            type="password"
            placeholder="Password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ivory-200/15 bg-ink-800/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40 focus:border-gold-400 focus:outline-none"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold-500 px-8 py-3 font-medium text-ink-900 transition hover:bg-gold-400 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ivory-200/60">
          {mode === 'signIn' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signUp')} className="text-gold-400 underline">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('signIn')} className="text-gold-400 underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
