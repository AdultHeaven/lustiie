// app/l/search/SearchPageClient.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Eye, MessageSquare, Clock, Tag as TagIcon } from "lucide-react";

type ModelRow = { slug: string; display_name: string; tags?: string[]; bio?: string };
type ThreadRow = {
  id: number;
  slug: string;
  title: string;
  body?: string | null;
  created_at?: string;
  views?: number | null;
  replies?: number | null;
  models?: { display_name?: string } | null;
};
type TagRow = { id: number; name: string };
type ResultPayload = { models: ModelRow[]; threads: ThreadRow[]; tags?: TagRow[] };

/* ---------- utils ---------- */
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text?: string, q?: string) {
  if (!text || !q) return text;
  try {
    const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
    const parts = text.split(re);
    return parts.map((part, i) =>
      re.test(part) ? (
        <mark
          key={i}
          className="rounded bg-fuchsia-600/20 px-1 py-0.5 text-fuchsia-200"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  } catch {
    return text;
  }
}

/* ---------- main component ---------- */
export default function SearchPageClient({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const router = useRouter();

  const qFromUrl = searchParams.q ?? "";
  const [q, setQ] = useState(qFromUrl);
  useEffect(() => {
    setQ(qFromUrl);
  }, [qFromUrl]);

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ResultPayload | null>(null);

  const debouncedQ = useDebounce(q, 350);

  useEffect(() => {
    const query = debouncedQ.trim();
    const nextUrl = query ? `/l/search?q=${encodeURIComponent(query)}` : "/l/search";

    if (qFromUrl !== query) router.replace(nextUrl);

    if (!query) {
      setRes(null);
      return;
    }
    (async () => {
      setLoading(true);
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query }),
      });
      const json = await r.json();
      setRes(json);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const query = q.trim();
      const nextUrl = query ? `/l/search?q=${encodeURIComponent(query)}` : "/l/search";
      router.replace(nextUrl);

      if (!query) {
        setRes(null);
        return;
      }
      (async () => {
        setLoading(true);
        const r = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: query }),
        });
        const json = await r.json();
        setRes(json);
        setLoading(false);
      })();
    }
  }

  const isTagMode = qFromUrl.trim().startsWith("#");
  const tagTerm = isTagMode ? qFromUrl.trim().slice(1) : "";

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {isTagMode ? `Tag: #${tagTerm}` : "Search"}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {isTagMode ? "Showing threads matched by this tag." : "Find models and threads."}
        </p>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search models, threads, tags…  (Tip: type #hello)"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/70 px-9 py-3 text-sm outline-none transition focus:border-neutral-700"
          />
        </div>
      </div>

      {loading && <Skeletons />}

      {!loading && !res && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm text-neutral-400">
          Start typing to search…
        </div>
      )}

      {!loading && res && (
        <Results q={qFromUrl} res={res} isTagMode={isTagMode} />
      )}
    </main>
  );
}

/* ---------- UI bits ---------- */
function Skeletons() {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 h-4 w-24 rounded bg-neutral-900" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 animate-pulse"
            />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 h-4 w-28 rounded bg-neutral-900" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 animate-pulse"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Results({ q, res, isTagMode }: { q: string; res: ResultPayload; isTagMode: boolean }) {
  return (
    <div className="space-y-8">
      {(isTagMode || (res.tags && res.tags.length > 0)) && (
        <section>
          <Header label="Tags" count={res.tags?.length ?? 0} />
          {(res.tags?.length ?? 0) === 0 ? (
            <Empty label={`No tags found for “${q.replace("#", "")}”.`} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {res.tags!.map((t) => (
                <Link
                  key={t.id}
                  href={`/l/search?q=%23${encodeURIComponent(t.name)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  <TagIcon className="h-3.5 w-3.5" /> #{t.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <Header label="Threads" count={res.threads.length} />
        {res.threads.length === 0 ? (
          <Empty label={`No threads found for “${q}”.`} />
        ) : (
          <div className="space-y-3">
            {res.threads.map((t) => (
              <Link
                key={t.id}
                href={`/t/${t.slug}`}
                className="block rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-4 transition hover:border-neutral-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">
                    {highlight(t.title, isTagMode ? q.replace("#", "") : q)}
                  </h3>
                  {t.models?.display_name && (
                    <span className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-0.5 text-[11px] text-neutral-300">
                      {t.models.display_name}
                    </span>
                  )}
                </div>

                {t.body && (
                  <p className="mt-2 text-sm text-neutral-300 line-clamp-2">
                    {highlight(t.body, isTagMode ? q.replace("#", "") : q)}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  {t.created_at && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(t.created_at).toLocaleString()}
                    </span>
                  )}
                  {typeof t.replies === "number" && (
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {t.replies.toLocaleString()} repl{t.replies === 1 ? "y" : "ies"}
                    </span>
                  )}
                  {typeof t.views === "number" && (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {t.views.toLocaleString()} views
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Header({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-2 flex items-baseline gap-2">
      <h2 className="text-sm font-semibold text-neutral-300">{label}</h2>
      <span className="text-xs text-neutral-500">
        {count} result{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">
      {label}
    </div>
  );
}
