'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

const USERNAME_RULE = /^[a-z0-9_]{3,20}$/i;

export default function UsernameGuard() {
  const pathname = usePathname();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [needUsername, setNeedUsername] = useState(false);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  // Never run on the verify page itself to avoid race with verifyOtp
  const onConfirmPage = pathname?.startsWith('/auth/confirm');

  // Passive: only run after we have a session
  async function loadProfileIfNeeded() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        setUserId(null);
        setNeedUsername(false);
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      const { data: prof, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', uid)
        .maybeSingle(); // no throw

      if (error) {
        // don’t break login; just log (optional)
        // console.debug('profiles select error', error.message);
      }

      const hasUsername = !!prof?.username;
      setNeedUsername(!hasUsername);
    } catch {
      // swallow – guard must never crash the page
    }
  }

  // 1) Check once on mount (if already logged in)
  useEffect(() => {
    if (onConfirmPage) return; // skip here
    loadProfileIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onConfirmPage]);

  // 2) React only to SIGNED_IN events
  useEffect(() => {
    if (onConfirmPage) return;
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === 'SIGNED_IN') loadProfileIfNeeded();
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, onConfirmPage]);

  async function isAvailable(candidate: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', candidate.toLowerCase())
        .limit(1);
      if (!data || data.length === 0) return true;
      return data[0].id === userId; // allow same user updating
    } catch {
      return false;
    }
  }

  async function saveUsername() {
    const raw = input.trim();
    if (!USERNAME_RULE.test(raw)) {
      alert('Username must be 3–20 chars: letters, numbers, underscores.');
      return;
    }
    if (!userId) {
      alert('No user session.');
      return;
    }

    const candidate = raw.toLowerCase();
    setSaving(true);

    if (!(await isAvailable(candidate))) {
      setSaving(false);
      alert('Sorry, that username is taken.');
      return;
    }

    try {
      // upsert into profiles
      const { error: upErr } = await supabase
        .from('profiles')
        .upsert(
          { id: userId, username: candidate, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
      if (upErr) throw upErr;

      // mirror to auth.user_metadata
      const { error: metaErr } = await supabase.auth.updateUser({ data: { username: candidate } });
      if (metaErr) throw metaErr;

      setNeedUsername(false);
      setInput('');
    } catch (e: any) {
      alert(e?.message || 'Could not save username.');
    } finally {
      setSaving(false);
    }
  }

  // Render nothing unless mounted, authed and missing username
  if (!mounted || !needUsername) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="px-5 py-4">
          <div className="text-sm font-semibold">Choose a username</div>
          <p className="mt-1 text-xs text-neutral-400">
            3–20 characters · letters, numbers, underscores. Must be unique.
          </p>
        </div>
        <div className="space-y-3 px-5 pb-5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="yourname"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
          />
          <button
            disabled={saving}
            onClick={saveUsername}
            className="w-full rounded-lg bg-fuchsia-600 py-2 text-sm font-semibold hover:bg-fuchsia-500 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save username'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
