// app/l/contact/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';


export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<'feedback' | 'bug' | 'copyright' | 'abuse' | 'other'>('feedback');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // tiny client validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
          hp, // bot trap
        }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to send your message.');
      }
      setDone(true);
      setName('');
      setEmail('');
      setMessage('');
      setTopic('feedback');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSending(false);
      setHp('');
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-100">
      {/* Header */}
      <header className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)]">
        <h1 className="text-3xl font-extrabold tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Have feedback, found a bug, or need help with moderation/copyright? Send us a note.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/l/rules"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:bg-neutral-800"
          >
            Read the Forum Rules
          </Link>
          <Link
            href="/l/privacy"
            className="rounded-lg border border-neutral-800 px-3 py-1.5 hover:bg-neutral-800"
          >
            Privacy Policy
          </Link>
          <Link
            href="/l/tos"
            className="rounded-lg border border-neutral-800 px-3 py-1.5 hover:bg-neutral-800"
          >
            Terms of Service
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Form */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  placeholder="you@lustiie.link"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                >
                  <option value="feedback">General feedback</option>
                  <option value="bug">Bug report</option>
                  <option value="abuse">Moderation / abuse</option>
                  <option value="copyright">Copyright / DMCA</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:pt-6">
                <p className="text-[11px] text-neutral-500">
                  For copyright requests, include links and a statement of authorization.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-300">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-40 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                placeholder="Be as specific as possible. Include steps to reproduce for bugs."
                maxLength={5000}
              />
              <div className="mt-1 text-right text-[11px] text-neutral-500">
                {Math.max(0, 5000 - message.length)} characters left
              </div>
            </div>

            {/* honeypot (hidden from humans) */}
            <div className="absolute left-[-9999px] top-[-9999px]">
              <label>
                Don’t fill this out
                <input value={hp} onChange={(e) => setHp(e.target.value)} />
              </label>
            </div>

            {error && (
              <div className="rounded border border-rose-900/60 bg-rose-900/10 p-3 text-sm text-rose-300">
                {error}
              </div>
            )}
            {done && (
              <div className="rounded border border-emerald-900/60 bg-emerald-900/10 p-3 text-sm text-emerald-300">
                Thanks! We received your message and will reply if needed.
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Link
                href="/"
                className="rounded border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={sending}
                className="rounded bg-gradient-to-r from-fuchsia-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar help */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
            <h2 className="text-sm font-semibold text-neutral-200">Tips</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-neutral-300">
              <li>For bugs, include your browser, device, and exact steps.</li>
              <li>For moderation, link to threads/posts and describe the issue.</li>
              <li>For copyright, include URLs and proof of authorization.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
            <h2 className="text-sm font-semibold text-neutral-200">Direct email</h2>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
                General: <a className="underline" href="mailto:hello@lustiie.link">hello@lustiie.link</a>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
                Privacy: <a className="underline" href="mailto:privacy@lustiie.link">privacy@lustiie.link</a>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
                Legal: <a className="underline" href="mailto:legal@lustiie.link">legal@lustiie.link</a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
            <h2 className="text-sm font-semibold text-neutral-200">Quick links</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="underline" href="/l/rules">Forum Rules</Link>
              </li>
              <li>
                <Link className="underline" href="/l/tos">Terms of Service</Link>
              </li>
              <li>
                <Link className="underline" href="/l/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
