// app/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import {
  Clock,
  Eye,
  MessageSquare,
  Tag as TagIcon,
  Flame,
  Plus,
} from "lucide-react";

type ThreadRow = {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  views: number | null;
  model_id: number | null;
};
type PostRow = {
  id: number;
  thread_id: number;
  author_id: string;
  created_at: string;
};
type ModelRow = { id: number; slug: string; display_name: string | null };

function parseIntOr(def: number, v?: string | null) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { page?: string; sort?: "latest" | "top" };
}) {
  const page = parseIntOr(1, searchParams?.page);
  const sort = (searchParams?.sort ?? "latest") as "latest" | "top";
  const PAGE_SIZE = 15;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = supabaseServer();

  // -------- Threads (main feed) --------
  const threadOrder =
    sort === "top"
      ? { column: "views" as const, ascending: false }
      : { column: "created_at" as const, ascending: false };

  const { data: threads, count: totalThreads } = await supabase
    .from("threads")
    .select("id,title,slug,created_at,views,model_id", { count: "exact" })
    // keep both null and false (some older rows may not have is_deleted set)
    .or("is_deleted.is.null,is_deleted.eq.false")
    .order(threadOrder.column, { ascending: threadOrder.ascending, nullsFirst: false })
    .range(from, to);

  const threadList: ThreadRow[] = threads ?? [];
  const threadIds = threadList.map((t) => t.id);

  // -------- Reply counts & last reply per thread (for current page) --------
  let replyCountByThread = new Map<number, number>();
  let lastPostByThread = new Map<number, PostRow>();

  if (threadIds.length) {
    const { data: posts } = await supabase
      .from("posts")
      .select("id,thread_id,author_id,created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    if (posts) {
      for (const p of posts) {
        replyCountByThread.set(p.thread_id, (replyCountByThread.get(p.thread_id) ?? 0) + 1);
        if (!lastPostByThread.has(p.thread_id)) {
          lastPostByThread.set(p.thread_id, p);
        }
      }
    }
  }

  // -------- Usernames for "last reply by" --------
  const lastAuthorIds = Array.from(new Set(Array.from(lastPostByThread.values()).map((p) => p.author_id)));
  let usernameById = new Map<string, string>();
  if (lastAuthorIds.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,username")
      .in("id", lastAuthorIds);
    for (const p of profs ?? []) {
      usernameById.set(p.id, p.username ?? "user");
    }
  }

  // -------- Tags for threads in the current page --------
  let tagsByThread = new Map<number, string[]>();
  if (threadIds.length) {
    const [{ data: ttags }, { data: allTags }] = await Promise.all([
      supabase.from("thread_tags").select("thread_id,tag_id").in("thread_id", threadIds),
      supabase.from("tags").select("id,name"),
    ]);
    const tagNameById = new Map<number, string>((allTags ?? []).map((t) => [t.id, t.name]));
    for (const row of ttags ?? []) {
      const name = tagNameById.get(row.tag_id);
      if (!name) continue;
      const list = tagsByThread.get(row.thread_id) ?? [];
      list.push(name);
      tagsByThread.set(row.thread_id, list);
    }
  }

  // -------- Popular tags (simple: newest 20) --------
  const { data: popTags } = await supabase
    .from("tags")
    .select("id,name")
    .order("created_at", { ascending: false })
    .limit(20);

  // -------- Trending models (counts from current page only; lightweight) --------
  let trending: Array<{ model: ModelRow; threads: number }> = [];
  {
    const { data: models } = await supabase
      .from("models")
      .select("id,slug,display_name")
      .limit(100);

    if (models && threadList.some((t) => t.model_id)) {
      const counts = new Map<number, number>();
      for (const t of threadList) {
        if (!t.model_id) continue;
        counts.set(t.model_id, (counts.get(t.model_id) ?? 0) + 1);
      }
      trending = Array.from(counts.entries())
        .map(([mid, c]) => {
          const m = models.find((mm) => mm.id === mid);
          return m ? { model: m, threads: c } : null;
        })
        .filter(Boolean) as Array<{ model: ModelRow; threads: number }>;
      trending.sort((a, b) => b.threads - a.threads);
    }
  }

  // -------- Recently active (top 5 unique threads by newest post) --------
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("thread_id,created_at")
    .order("created_at", { ascending: false })
    .limit(80); // de-dup in code

  let recentThreads: ThreadRow[] = [];
  if (recentPosts?.length) {
    const seen = new Set<number>();
    const recentThreadIds: number[] = [];
    for (const p of recentPosts) {
      if (!seen.has(p.thread_id)) {
        seen.add(p.thread_id);
        recentThreadIds.push(p.thread_id);
        if (recentThreadIds.length >= 5) break;
      }
    }
    if (recentThreadIds.length) {
      const { data } = await supabase
        .from("threads")
        .select("id,title,slug,created_at,views,model_id")
        .in("id", recentThreadIds);
      recentThreads = (data ?? []).sort(
        (a, b) => recentThreadIds.indexOf(a.id) - recentThreadIds.indexOf(b.id)
      );
    }
  }

  // -------- Top contributors (last 7 days) --------
  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentWeek } = await supabase
    .from("posts")
    .select("author_id")
    .gte("created_at", last7)
    .limit(500);

  type Contributor = { id: string; count: number; username: string };
  let topContribs: Contributor[] = [];
  if (recentWeek?.length) {
    const counts = new Map<string, number>();
    for (const p of recentWeek) {
      counts.set(p.author_id, (counts.get(p.author_id) ?? 0) + 1);
    }
    const topIds = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    if (topIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,username")
        .in("id", topIds);
      const nameById = new Map<string, string>(
        (profs ?? []).map((p) => [p.id, p.username ?? "user"])
      );
      topContribs = topIds.map((id) => ({
        id,
        count: counts.get(id) ?? 0,
        username: nameById.get(id) ?? "user",
      }));
    }
  }

  const totalPages = Math.max(1, Math.ceil((totalThreads ?? 0) / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* HERO */}
      <section className="border-b border-neutral-900/70 bg-gradient-to-r from-neutral-900/60 to-neutral-900/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome to Lustiie</h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-300 sm:text-base">
          A text-only forum for discussing adult topics — no images, no explicit media. Keep it respectful.          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/l/search"
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:bg-neutral-800"
            >
              Browse search
            </Link>
            <Link
              href="/thread/new"
              className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-3 py-1.5 font-medium hover:bg-fuchsia-500"
            >
              <Plus className="h-4 w-4" /> Start a thread
            </Link>
            <Link
              href="/l/rules"
              className="rounded-lg border border-neutral-800 px-3 py-1.5 hover:bg-neutral-800"
            >
              Read the rules
            </Link>
          </div>
        </div>
      </section>

      {/* BODY */}
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-3">
        {/* SIDEBAR */}
        <aside className="order-2 md:order-1 md:col-span-1">
          {/* Trending Models */}
          {trending.length > 0 && (
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-300">
                <Flame className="h-4 w-4" /> Trending Models
              </h2>
              <ul className="space-y-2 text-sm">
                {trending.slice(0, 8).map(({ model, threads }) => (
                  <li
                    key={model.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 hover:bg-neutral-800/60"
                  >
                    <Link href={`/m/${model.slug}`} className="truncate hover:underline">
                      {model.display_name || model.slug}
                    </Link>
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300">
                      {threads}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Popular Tags */}
          <section
            className={`rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 ${
              trending.length ? "mt-6" : ""
            }`}
          >
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              <TagIcon className="h-4 w-4" /> Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {(popTags ?? []).map((t) => (
                <Link
                  key={t.id}
                  href={`/l/search?q=%23${encodeURIComponent(t.name)}`}
                  className="rounded-full border border-neutral-700/80 bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  #{t.name}
                </Link>
              ))}
              {(popTags ?? []).length === 0 && (
                <div className="text-xs text-neutral-500">No tags yet.</div>
              )}
            </div>
          </section>

          {/* Recently Active */}
          <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Recently Active
            </h2>
            {recentThreads.length === 0 ? (
              <div className="text-xs text-neutral-500">No recent activity.</div>
            ) : (
              <ul className="space-y-2">
                {recentThreads.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 hover:bg-neutral-800/60"
                  >
                    <Link href={`/thread/${t.slug}`} className="line-clamp-2 text-sm hover:underline">
                      {t.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {(t.views ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Top Contributors (7d) */}
          <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Top Contributors (7d)
            </h2>
            {topContribs.length === 0 ? (
              <div className="text-xs text-neutral-500">No replies yet this week.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {topContribs.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 p-2"
                  >
                    <span className="truncate text-neutral-200">@{u.username}</span>
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300">
                      {u.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        {/* FEED */}
        <section className="order-1 md:order-2 md:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-300">
                {sort === "top" ? "Top Threads" : "Latest Threads"}
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href={`/?sort=latest`}
                  className={`rounded border px-2 py-1 ${
                    sort === "latest"
                      ? "border-neutral-200 text-neutral-100"
                      : "border-neutral-700 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Latest
                </Link>
                <Link
                  href={`/?sort=top`}
                  className={`rounded border px-2 py-1 ${
                    sort === "top"
                      ? "border-neutral-200 text-neutral-100"
                      : "border-neutral-700 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Top
                </Link>
                <Link
                  href="/thread/new"
                  className="ml-2 rounded-lg bg-fuchsia-600 px-3 py-1.5 text-sm font-medium hover:bg-fuchsia-500"
                >
                  New Thread
                </Link>
              </div>
            </div>

            <ul className="divide-y divide-neutral-800">
              {threadList.map((t) => {
                const replies = replyCountByThread.get(t.id) ?? 0;
                const last = lastPostByThread.get(t.id);
                const lastUser = last ? (usernameById.get(last.author_id) ?? "user") : null;
                const tTags = tagsByThread.get(t.id) ?? [];

                return (
                  <li key={t.id} className="p-4 hover:bg-neutral-900/55">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link href={`/thread/${t.slug}`} className="block text-base font-semibold hover:underline">
                          {t.title}
                        </Link>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(t.created_at).toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {(t.views ?? 0).toLocaleString()} views
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {replies}
                          </span>
                          {last && (
                            <span>
                              • last by <span className="text-neutral-300">{lastUser}</span>
                            </span>
                          )}
                        </div>

                        {tTags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tTags.slice(0, 6).map((tag) => (
                              <Link
                                key={tag}
                                href={`/l/search?q=%23${encodeURIComponent(tag)}`}
                                className="rounded-full border border-neutral-700 px-2.5 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
                              >
                                #{tag}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-300">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {replies}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}

              {threadList.length === 0 && (
                <li className="p-6 text-sm text-neutral-400">Loading.</li>
              )}
            </ul>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-3 text-sm">
              <div className="text-neutral-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/?sort=${sort}&page=${Math.max(1, page - 1)}`}
                  className={`rounded border px-3 py-1 ${
                    page <= 1 ? "pointer-events-none opacity-40" : "border-neutral-700 hover:text-white"
                  }`}
                >
                  Prev
                </Link>
                <Link
                  href={`/?sort=${sort}&page=${Math.min(totalPages, page + 1)}`}
                  className={`rounded border px-3 py-1 ${
                    page >= totalPages ? "pointer-events-none opacity-40" : "border-neutral-700 hover:text-white"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
