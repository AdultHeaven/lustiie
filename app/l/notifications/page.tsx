// app/_/notifications/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type N = {
  id: number; type: 'thread_reply' | 'reply_to_you';
  thread_id: number; post_id: number; actor_id: string;
  created_at: string; read_at: string | null;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/notifications?limit=50');
    const j = await r.json();
    setItems(j.items ?? []);
    setLoading(false);
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
    load();
  }

  useEffect(() => { load(); }, []);

  if (loading) return <main className="max-w-3xl mx-auto p-6">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button onClick={markAllRead} className="rounded border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900">Mark all as read</button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <div className="text-neutral-400 text-sm">No notifications.</div>}
        {items.map(n => (
          <Link key={n.id} href={`/t/${n.thread_id}`} className={`block rounded border p-3 ${n.read_at ? 'border-neutral-800 bg-neutral-950/50' : 'border-fuchsia-700/40 bg-fuchsia-950/20'}`}>
            <div className="text-sm">
              {n.type === 'thread_reply' ? 'New reply in a thread you follow' : 'Someone replied to your comment'}
            </div>
            <div className="text-xs text-neutral-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
