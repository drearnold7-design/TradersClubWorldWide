// app/(portal)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      setProfile(data);
    });
  }, []);

  const saveProfile = async () => {
    await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
      })
      .eq('id', profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    if (newPassword.length < 8) return;
    await supabase.auth.updateUser({ password: newPassword });
    setNewPassword('');
    setPasswordChanged(true);
    setTimeout(() => setPasswordChanged(false), 2000);
  };

  if (!profile) return <p className="text-ivory-200/60">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl">Profile</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(['first_name', 'last_name', 'phone', 'city', 'state'] as const).map((field) => (
            <input
              key={field}
              placeholder={field.replace('_', ' ')}
              value={profile[field] ?? ''}
              onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              className="rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:capitalize placeholder:text-ivory-200/40"
            />
          ))}
        </div>
        <button
          onClick={saveProfile}
          className="mt-4 rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink-900 hover:bg-gold-400"
        >
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold-400">Change Password</h2>
        <div className="mt-4 flex max-w-sm gap-3">
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 rounded-lg border border-ivory-200/15 bg-ink-900/40 px-4 py-3 text-ivory-50 placeholder:text-ivory-200/40"
          />
          <button
            onClick={changePassword}
            className="rounded-lg bg-ink-800 px-5 py-3 text-sm font-medium text-ivory-50 hover:bg-ink-800/70"
          >
            {passwordChanged ? 'Updated ✓' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
