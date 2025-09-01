// app/profile/page.tsx
import { supabaseServer } from '@/lib/supabase';
import Link from 'next/link';

type ThreadRow = { id: number; title: string; slug: string; created_at: string };
type PostRow = {
  id: number;
  body: string;
  created_at: string;
  thread_id: number;
  threads?: { slug: string; title: string } | null; // joined if FK available
};

export default async function ProfilePage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-neutral-400">Please sign in to view your profile.</p>
    </main>
  );

  // Profile + username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, created_at, updated_at, role')
    .eq('id', user.id)
    .maybeSingle();

  // Counts (exact, head-only)
  const [threadsCount, postsCount, votesCount] = await Promise.all([
    supabase.from('threads').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('posts').select('id',   { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('votes').select('post_id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  const counts = {
    threads: threadsCount.count ?? 0,
    posts: postsCount.count ?? 0,
    votes: votesCount.count ?? 0,
  };

  // Recent 10 threads
  const { data: threads } = await supabase
    .from('threads')
    .select('id,title,slug,created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10) as { data: ThreadRow[] | null, error: any };

  // Recent 10 posts with a join to threads if FK exists
  const { data: posts } = await supabase
    .from('posts')
    .select('id,body,created_at,thread_id,threads!inner(slug,title)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10) as { data: PostRow[] | null, error: any };

  const displayName = profile?.username || user.email || 'You';
  const avatarLetter = (profile?.username || user.email || '?').slice(0, 1)?.toUpperCase();
  const memberSince = (user.user_metadata?.created_at || user.created_at)
    ? new Date(user.created_at!).toLocaleDateString()
    : '—';

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header card */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600/30 to-rose-600/30 text-xl font-bold text-white border border-neutral-800">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white break-words">
              {displayName}
            </h1>
            <div className="mt-1 text-sm text-neutral-400">
              Member since {memberSince}
              {/* {profile?.role ? <span className="ml-2 rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-300">{profile.role}</span> : null} */}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/_/settings"
                className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
              >
                Settings
              </Link>
              <Link
                href="/thread/new"
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:opacity-90"
              >
                New Thread
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Threads" value={counts.threads} />
            <Stat label="Replies" value={counts.posts} />
            <Stat label="Votes" value={counts.votes} />
          </div>
        </div>
      </section>

      {/* Recent threads */}
      <section className="mt-8">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300">Your recent threads</h2>
          {counts.threads > 10 && (
            <Link href="/_/threads?filter=mine" className="text-xs text-neutral-400 hover:text-neutral-200 underline">
              View all
            </Link>
          )}
        </header>

        <div className="grid gap-2">
          {(threads ?? []).length > 0 ? (
            (threads ?? []).map((t) => (
              <Link
                key={t.id}
                href={`/t/${t.slug}`}
                className="block rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 hover:bg-neutral-900/60"
              >
                <div className="truncate text-sm text-neutral-100">{t.title}</div>
                <div className="mt-1 text-[11px] text-neutral-500">
                  {new Date(t.created_at).toLocaleString()}
                </div>
              </Link>
            ))
          ) : (
            <Empty text="No threads yet. Start the first one!" cta={{ href: '/thread/new', label: 'Create thread' }} />
          )}
        </div>
      </section>

      {/* Recent replies */}
      <section className="mt-8">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300">Your recent replies</h2>
          {counts.posts > 10 && (
            <Link href="/_/posts?filter=mine" className="text-xs text-neutral-400 hover:text-neutral-200 underline">
              View all
            </Link>
          )}
        </header>

        <div className="grid gap-2">
          {(posts ?? []).length > 0 ? (
            (posts ?? []).map((p) => {
              const threadTitle = p.threads?.title ?? 'Thread';
              const threadSlug = p.threads?.slug ?? '#';
              return (
                <Link
                  key={p.id}
                  href={threadSlug === '#' ? '#' : `/t/${threadSlug}`}
                  className="block rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 hover:bg-neutral-900/60"
                >
                  <div className="truncate text-[13px] text-neutral-100">{threadTitle}</div>
                  <div className="mt-1 line-clamp-2 whitespace-pre-wrap text-[13px] leading-6 text-neutral-300">
                    {p.body}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-500">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </Link>
              );
            })
          ) : (
            <Empty text="No replies yet. Join a discussion!" />
          )}
        </div>
      </section>
    </main>
  );
}

/* --------- UI bits --------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2">
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-neutral-100 tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}

function Empty({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-6 text-center text-sm text-neutral-400">
      <div>{text}</div>
      {cta && (
        <Link href={cta.href} className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-sm font-medium text-black">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
