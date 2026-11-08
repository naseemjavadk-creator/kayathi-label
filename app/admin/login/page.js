'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'forbidden') {
      setError('This account does not have owner access.');
    }
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const rlRes = await fetch('/api/admin/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'attempt' }),
      });
      if (rlRes.status === 429) {
        const rlData = await rlRes.json().catch(() => ({}));
        setBusy(false);
        setError(rlData.message || 'Too many login attempts. Please wait 15 minutes and try again.');
        return;
      }
    } catch {
      /* continue if rate-limit endpoint is unreachable */
    }

    const sb = supabaseBrowser();
    const { data, error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setBusy(false);
      setError('Email or password is incorrect.');
      return;
    }
    const { data: admin } = await sb.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (!admin) {
      await sb.auth.signOut();
      setBusy(false);
      setError('This account does not have owner access.');
      return;
    }
    try {
      await fetch('/api/admin/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
    } catch {}
    router.replace('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-espresso/15 bg-white p-8">
        <p className="text-center font-serif text-2xl tracking-[0.25em] text-burgundy">KAYATHI LABEL</p>
        <h1 className="mt-6 text-center text-3xl">Owner login</h1>
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="current-password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
