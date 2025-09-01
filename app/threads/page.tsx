// app/threads/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, MessageSquare, Clock, Flame, Filter, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type SortMode = 'latest' | 'replies' | 'views' | 'active';

type ThreadRow = {
  id: number;
  slug: string;
  title: string;
  body: string;
  created_at: string;
  views: number | null;
  replies: number;
  last_reply_at: string;
  tags: string[];
};

export default function ThreadsIndexPage() {
  const [sort, setSort] = useState<SortMode>('latest');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function load() {
    setLoading(true);
    const url = `/api/threads?sort=${encodeURIComponent(sort)}&page=${page}&pageSize=${pageSize}`;
    const r = await fetch(url);
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      alert(j.error || 'Failed to load threads');
      return;
    }
    setRows(j.threads || []);
    setTotal(j.total || 0);
  }

  useEffect(() => { load(); }, [sort, page, pageSize]);

  const headerLabel = (() => {
    switch (sort) {
      case 'latest': return 'Latest threads';
      case 'replies': return 'Most replied';
      case 'views': return 'Most viewed';
      case 'active': return 'Recently active';
    }
  })();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Threads</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Browse discussions. Sort by activity, replies, or views. Click a thread to dive in.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300">
            <Filter className="h-4 w-4" />
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortMode); setPage(1); }}
              className="bg-transparent text-neutral-100 outline-none"
            >
              <option value="latest">Latest</option>
              <option value="active">Recently active</option>
              <option value="replies">Most replies</option>
              <option value="views">Most views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subheader */}
      <div className="mb-4 flex items-center justify-between text-xs text-neutral-400">
        <div className="inline-flex items-center gap-2">
          <Flame className="h-4 w-4" />
          <span>{headerLabel}</span>
        </div>
        <div>
          Showing page <span className="text-neutral-200">{page}</span> of <span className="text-neutral-200">{totalPages}</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-neutral-800/70 bg-neutral-950/50 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm text-neutral-400">
            No threads yet.
          </div>
        )}

        {!loading && rows.map((t) => (
          <article
            key={t.id}
            className="group relative overflow-hidden rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-4 transition hover:border-neutral-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/thread/${t.slug}`} className="block">
                  <h2 className="truncate text-lg font-semibold text-white hover:underline">
                    {t.title}
                  </h2>
                </Link>

                {/* Tags */}
                {t.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {t.tags.length > 6 && (
                      <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-400">
                        +{t.tags.length - 6}
                      </span>
                    )}
                  </div>
                )}

                {/* Snippet */}
                {t.body && (
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-300">
                    {t.body}
                  </p>
                )}

                {/* Meta */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {t.replies.toLocaleString()} replies
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {(t.views ?? 0).toLocaleString()} views
                  </span>
                  <span className="hidden items-center gap-1 sm:inline-flex">
                    <Clock className="h-4 w-4" />
                    active {new Date(t.last_reply_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href={`/thread/${t.slug}`}
                className="mt-1 hidden shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-200 transition group-hover:bg-neutral-900 sm:inline-flex items-center gap-1"
                aria-label="Open thread"
              >
                Open <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>

          <div className="text-xs text-neutral-400">
            Page <span className="text-neutral-200">{page}</span> / <span className="text-neutral-200">{totalPages}</span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
