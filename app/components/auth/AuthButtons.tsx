// app/components/auth/AuthButtons.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Bell, LogIn, Menu, User, X } from 'lucide-react';

type Props = { authed: boolean; email?: string };

export function AuthButtons({ authed, email }: Props) {
  const [open, setOpen] = useState(false);      // auth modal
  const [drawer, setDrawer] = useState(false);  // mobile menu
  const [mail, setMail] = useState(email ?? '');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  // If we become authed (after confirming), close the modal automatically
  useEffect(() => {
    if (authed && open) setOpen(false);
  }, [authed, open]);

  async function signInMagic(e: React.FormEvent) {
    e.preventDefault();
    const supabase = supabaseBrowser();

    // We’re using token-hash links in the email template:
    //   /auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
    // So DO NOT pass emailRedirectTo here (that’s for PKCE links).
    const { error } = await supabase.auth.signInWithOtp({ email: mail });

    if (error) {
      alert(error.message);
      return;
    }
    setOpen(false);
    alert('Magic link sent. Check your inbox.');
  }

  async function signInGoogle() {
    const supabase = supabaseBrowser();
    // Client-side OAuth is fine (SDK sets the PKCE cookie):
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    // Hard refresh to sync SSR header + client
    router.refresh();
  }

  return (
    <>
      <div className="ml-2 flex items-center gap-2 sm:gap-3">
        <Link
          href="/l/notifications"
          className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>

        {authed ? (
          <div className="relative">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
              aria-label="Account menu"
              onClick={() => setDrawer(v => !v)}
            >
              <User className="h-4 w-4" />
            </button>
            {drawer && (
              <div className="absolute right-0 mt-2 z-50 w-48 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-1 text-sm shadow-2xl">
                <div className="px-3 py-2 text-xs text-neutral-400">{email}</div>
                <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-800" href="/profile">Profile</Link>
                <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-800" href="/_/settings">Settings</Link>
                <button
                  onClick={signOut}
                  className="block w-full rounded-lg px-3 py-2 text-left text-rose-300 hover:bg-neutral-800"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
              aria-label="Sign in"
              onClick={() => setOpen(true)}
            >
              <LogIn className="h-4 w-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 md:hidden"
              aria-label="Menu"
              onClick={() => setDrawer(v => !v)}
            >
              {drawer ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {drawer && (
              <div className="absolute inset-x-0 top-[56px] z-40 border-b border-neutral-900/60 bg-neutral-950/95 p-3 md:hidden">
                <div className="grid gap-2 text-sm">
                  <Link href="/models" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">Models</Link>
                  <Link href="/_/search" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">Search</Link>
                  <Link href="/_/rules" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">Rules</Link>
                  <Link href="/thread/new" className="rounded-lg bg-fuchsia-600 px-3 py-2 font-medium hover:bg-fuchsia-500">Start a thread</Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth modal */}
      {mounted && open && createPortal(
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="bg-gradient-to-r from-fuchsia-600/15 to-rose-600/15 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Sign in to Lustliie</div>
                <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-800">
                  Close
                </button>
              </div>
            </div>

            <form onSubmit={signInMagic} className="space-y-3 p-5">
              <div>
                <label className="mb-1 block text-xs text-neutral-300">Email (magic link)</label>
                <input
                  type="email"
                  required
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  placeholder="you@lustliie.link"
                />
              </div>
              <button type="submit" className="w-full rounded-lg bg-fuchsia-600 py-2 text-sm font-semibold hover:bg-fuchsia-500">
                Send magic link
              </button>
              <button
                type="button"
                onClick={signInGoogle}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 text-sm hover:bg-neutral-900"
              >
                Continue with Google
              </button>
              <div className="text-center text-xs text-neutral-400">
                By continuing you agree to our <Link href="/_/tos" className="underline">Terms</Link> and <Link href="/_/privacy" className="underline">Privacy Policy</Link>.
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
