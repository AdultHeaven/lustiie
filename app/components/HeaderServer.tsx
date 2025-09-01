'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { AuthButtons } from './auth/AuthButtons';
import { Search, Plus } from 'lucide-react';

export default function HeaderClient() {
  // one client instance
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const authed = !!userEmail;

  // initial load + live updates
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? undefined);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email ?? undefined);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => { if (unsub) unsub(); };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-900/70 bg-neutral-950/85 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55">
      {/* -------- MOBILE HEADER (only) -------- */}
      <div className="md:hidden">
        <div className="mx-auto max-w-7xl px-3">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-block h-7 w-7 rounded-lg bg-gradient-to-br from-fuchsia-600 to-rose-600 shadow-[0_0_16px_rgba(236,72,153,.25)]" />
              <span className="text-sm font-semibold tracking-tight">Lustliie</span>
            </Link>
            <AuthButtons authed={authed} email={userEmail} />
          </div>
        </div>

        {/* Mobile search row */}
        <div className="border-t border-neutral-900/60">
          <form action="/l/search" className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                name="q"
                inputMode="search"
                placeholder="Search models, threads, tags…"
                aria-label="Search"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-700"
              />
            </div>
            <Link
              href="/thread/new"
              className="shrink-0 rounded-xl bg-fuchsia-600 px-3 py-2 text-xs font-semibold hover:bg-fuchsia-500"
            >
              <span className="inline-flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> New
              </span>
            </Link>
          </form>
        </div>
      </div>

      {/* -------- DESKTOP HEADER -------- */}
      <div className="hidden md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
          <img
  src="/favicon.png"
  alt="Lustliie Logo"
  className="h-7 w-7 rounded-lg"
/>
            <span className="text-base font-semibold tracking-tight">Lustiie</span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 flex items-center gap-4 text-sm text-neutral-300">
            <Link className="hover:text-white/90" href="/threads">Threads</Link>
            <Link className="hover:text-white/90" href="/l/search">Search</Link>
            <Link className="hover:text-white/90" href="/l/rules">Rules</Link>
            {authed && <Link className="hover:text-white/90" href="/profile">Profile</Link>}
          </nav>

          {/* Desktop search */}
          <div className="ml-auto flex-1 max-w-xl">
            <form action="/l/search" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                name="q"
                placeholder="Search models, threads, tags…"
                aria-label="Search"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 pl-9 pr-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-700"
              />
            </form>
          </div>

          {/* Desktop New Thread */}
          <Link
            href="/thread/new"
            className="ml-3 shrink-0 rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-medium hover:bg-fuchsia-500"
          >
            New Thread
          </Link>

          {/* Auth + notifications */}
          <AuthButtons authed={authed} email={userEmail} />
        </div>
      </div>

      {/* -------- Slim tabs (shared) -------- */}
      {/* <nav className="border-t border-neutral-900/70 bg-neutral-950/60">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2 sm:px-4">
          <Link href="/" className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-200 ring-1 ring-neutral-800">
            Home
          </Link>
          <Link href="/threads" className="rounded-full px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-900 ring-1 ring-transparent hover:ring-neutral-800">
            Threads
          </Link>
          <Link href="/_/search?q=latest" className="rounded-full px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-900 ring-1 ring-transparent hover:ring-neutral-800">
            Latest
          </Link>
          <Link href="/_/search?q=top" className="rounded-full px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-900 ring-1 ring-transparent hover:ring-neutral-800">
            Top
          </Link>
        </div>
      </nav> */}
    </header>
  );
}
