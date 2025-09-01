// app/_/settings/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Check, Loader2, Mail, Shield, Trash2, User, AlertTriangle } from 'lucide-react';

const USERNAME_RULE = /^[a-z0-9_]{3,20}$/i;

type Counts = {
  threads: number;
  posts: number;
  votes: number;
};

export default function SettingsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // user + profile
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [counts, setCounts] = useState<Counts>({ threads: 0, posts: 0, votes: 0 });

  // notifications (stored in auth.user_metadata.notify)
  const [notifyThreadReplies, setNotifyThreadReplies] = useState(false);
  const [notifyMyReplyChildren, setNotifyMyReplyChildren] = useState(false);
  const [notifyMentions, setNotifyMentions] = useState(false);

  // deletion request
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? '');

      // read metadata toggles
      const meta: any = user.user_metadata || {};
      const notify = meta.notify || {};
      setNotifyThreadReplies(!!notify.thread_replies);
      setNotifyMyReplyChildren(!!notify.reply_children);
      setNotifyMentions(!!notify.mentions);

      // profile username
      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      setUsername(prof?.username ?? '');

      // counts
      const [thr, pst, vts] = await Promise.all([
        supabase.from('threads').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('votes').select('post_id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setCounts({
        threads: thr.count ?? 0,
        posts: pst.count ?? 0,
        votes: vts.count ?? 0,
      });

      setLoading(false);
    })();
  }, [supabase]);

  async function isUsernameAvailable(candidate: string) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate.toLowerCase())
      .limit(1);
    if (!data || data.length === 0) return true;
    return data[0].id === userId; // allow your own
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    // Validate username
    const raw = username.trim();
    if (!USERNAME_RULE.test(raw)) {
      alert('Username must be 3–20 chars: letters, numbers, underscores.');
      return;
    }
    const candidate = raw.toLowerCase();

    setSaving(true);
    try {
      if (!(await isUsernameAvailable(candidate))) {
        alert('Sorry, that username is taken.');
        setSaving(false);
        return;
      }

      // Upsert username in profiles
      const { error: upErr } = await supabase
        .from('profiles')
        .upsert({ id: userId, username: candidate, updated_at: new Date().toISOString() }, { onConflict: 'id' });

      if (upErr) throw upErr;

      // Mirror to auth.user_metadata (optional but handy)
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { username: candidate },
      });
      if (metaErr) throw metaErr;

      alert('Saved ✨');
    } catch (e: any) {
      alert(e?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notify: {
            thread_replies: notifyThreadReplies,
            reply_children: notifyMyReplyChildren,
            mentions: notifyMentions,
          },
        },
      });
      if (error) throw error;
      alert('Notification preferences saved.');
    } catch (e: any) {
      alert(e?.message || 'Failed to save notifications.');
    } finally {
      setSaving(false);
    }
  }

  function clearLocalPrefs() {
    try {
      // Keep it simple: namespace any keys you use elsewhere if needed.
      localStorage.removeItem('ui:compact');
      localStorage.removeItem('ui:theme'); // if you add a theme later
      alert('Local preferences cleared.');
    } catch {}
  }

  async function requestDeletion() {
    if (!userId) return;
    if (!confirm('Send an account deletion request?')) return;

    setDeleting(true);
    try {
      // We’ll use the reports table you already have
      const { error } = await supabase.from('reports').insert({
        target_type: 'account',
        target_id: 0,        // optional: you could store a numeric pointer; if not, omit this
        reporter_id: userId, // who asked
        reason: deleteReason || 'User requested account deletion',
        status: 'open',
      });
      if (error) throw error;
      alert('Request sent. We’ll review and process it.');
      setDeleteReason('');
    } catch (e: any) {
      alert(e?.message || 'Failed to send request.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-neutral-800" />
          <div className="h-28 rounded-2xl border border-neutral-800 bg-neutral-950/70" />
          <div className="h-40 rounded-2xl border border-neutral-800 bg-neutral-950/70" />
          <div className="h-40 rounded-2xl border border-neutral-800 bg-neutral-950/70" />
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-neutral-400">You need to sign in to access settings.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
      <p className="mt-1 text-sm text-neutral-400">Manage your profile, notifications, and account.</p>

      {/* Overview */}
      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <User className="h-4 w-4" /> Account overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Email" value={email || '—'} />
          <InfoRow label="Username" value={username || '—'} />
          <InfoRow label="Threads" value={counts.threads.toLocaleString()} />
          <InfoRow label="Posts" value={counts.posts.toLocaleString()} />
          <InfoRow label="Votes" value={counts.votes.toLocaleString()} />
        </div>
      </section>

      {/* Profile */}
      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <User className="h-4 w-4" /> Profile
        </h2>

        <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-[240px_1fr_auto] items-center">
          <label className="text-xs text-neutral-400">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
        </form>

        <p className="mt-2 text-xs text-neutral-500">
          3–20 chars; letters, numbers, underscores. Must be unique.
        </p>
      </section>

      {/* Notifications */}
      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <Mail className="h-4 w-4" /> Email notifications
        </h2>

        <div className="space-y-3">
          <Toggle
            label="Replies to threads I follow"
            checked={notifyThreadReplies}
            onChange={setNotifyThreadReplies}
          />
          <Toggle
            label="Replies to my replies"
            checked={notifyMyReplyChildren}
            onChange={setNotifyMyReplyChildren}
          />
          <Toggle
            label="Mentions of my username"
            checked={notifyMentions}
            onChange={setNotifyMentions}
          />
        </div>

        <div className="mt-3">
          <button
            onClick={saveNotifications}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save preferences
          </button>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          These preferences are stored in your account metadata. We’ll use them when we add follow & notifications.
        </p>
      </section>

      {/* Local preferences */}
      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <Shield className="h-4 w-4" /> Local preferences
        </h2>
        <p className="text-sm text-neutral-400">
          Clear on-device UI settings (theme, density, etc.). Does not affect your data.
        </p>
        <button
          onClick={clearLocalPrefs}
          className="mt-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
        >
          Clear local preferences
        </button>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl border border-rose-900/60 bg-neutral-950/60 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-300">
          <AlertTriangle className="h-4 w-4" /> Danger zone
        </h2>

        <label className="text-xs text-neutral-400">Tell us why (optional)</label>
        <textarea
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm outline-none focus:border-neutral-700"
          placeholder="Reason for account deletion request…"
        />

        <button
          onClick={requestDeletion}
          disabled={deleting}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Request account deletion
        </button>

        <p className="mt-2 text-xs text-neutral-500">
          This sends a request to moderators (stored in <code>reports</code>). It does not immediately delete your account.
        </p>
      </section>
    </main>
  );
}

/* ---------- small UI helpers ---------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-sm text-neutral-200">{value}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2">
      <span className="text-sm text-neutral-200">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-fuchsia-600' : 'bg-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </label>
  );
}
