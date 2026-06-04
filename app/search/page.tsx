"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Play } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import "../searchCSS.css";
import "../gamePage.css";

type Video = {
  id: string;
  model_id: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  uploader_username?: string | null;
  uploaded_at?: string | null;
  video_name?: string | null;
};

export default function SearchPage() {
  const PREVIEW_LIMIT = 12;
  const WORKER_BASE = "https://postgres-search.ahapi.workers.dev";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<any>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const latestQueryRef = useRef<string>("");

  const params = useParams();
  const searchParams = useSearchParams();

  function normalizeResponse(data: any) {
    if (!data) return { rows: [], nextCursor: null, ok: false };
    if (data.ok !== undefined) {
      return {
        rows: data.rows ?? data.results ?? [],
        nextCursor: data.nextCursor ?? null,
        ok: data.ok,
      };
    }
    if (Array.isArray(data)) return { rows: data, nextCursor: null, ok: true };
    return { rows: [], nextCursor: null, ok: false };
  }

  async function fetchResults(q: string, reset = false) {
    if (abortRef.current) abortRef.current.abort();

    if (q.length > 0 && q.length < 3) {
      setInfoMsg("Type at least 3 characters to search");
      return;
    }

    setInfoMsg(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    if (reset) {
      setResults([]);
      setNextCursor(null);
    }

    latestQueryRef.current = q;

    try {
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("limit", String(PREVIEW_LIMIT));

      if (!reset && nextCursor?.uploaded_at) {
        params.set("cursor_uploaded_at", nextCursor.uploaded_at);
        params.set("cursor_id", nextCursor.id);
      }

      const res = await fetch(`${WORKER_BASE}/?${params}`, {
        signal: controller.signal,
      });

      const json = await res.json();
      const normalized = normalizeResponse(json);

      if (!normalized.ok) return;

      setResults((prev) =>
        reset ? normalized.rows : [...prev, ...normalized.rows]
      );
      setNextCursor(normalized.nextCursor);
    } catch (e) {
      if ((e as any).name !== "AbortError") console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") fetchResults(query, true);
  }

  // 🔥 URL → input → auto-search
  useEffect(() => {
    let initial = searchParams.get("q");

    if (!initial && params?.slug) {
      initial = Array.isArray(params.slug)
        ? params.slug.join(" ")
        : params.slug;
    }

    if (initial) {
      const decoded = decodeURIComponent(initial.replace(/\+/g, " "));
      setQuery(decoded);
      fetchResults(decoded, true);
    }
  }, []);

  const fallbackThumb =
    "https://img202.imagetwist.com/th/71768/upobborof86g.jpg";

  return (
    <>
      {/* <Script src="/searchPopUpAd.js" strategy="afterInteractive" /> */}

      <div className="search-page">
        {/* ================= SEARCH HEADER ================= */}
        <div className="search-page-header">
          <h1 className="search-title">Search</h1>
          <p className="search-subtitle">Find models and videos.</p>

          <div className="search-input-wrapper">
            <span className="search-input-icon">
              <Search />
            </span>

            <input
              className="search-input-main"
              placeholder="  Search models, videos, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          {results.length === 0 && !loading && (
            <div className="search-empty-panel">
              Start typing to search...
            </div>
          )}
        </div>

        {infoMsg && <div className="search-info">{infoMsg}</div>}

        {/* ================= RESULTS ================= */}
        <div className="results-grid">
          {loading && results.length === 0 ? (
            <p className="results-message">Loading results...</p>
          ) : (
            results.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 1.02 }}
                className="video-card"
              >
                <a
href={video.id ? `/video/${video.id}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="thumbnail-wrapper"
                >
                  <img
                    src={video.thumbnail_url || fallbackThumb}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = fallbackThumb)
                    }
                  />
                  <div className="thumbnail-overlay">
                    <Play />
                  </div>
                </a>

                <div className="card-content">
                  <h2 className="video-title">{video.video_name}</h2>
                  {/* <Link
                    href={`https://adultheaven.fun/leaks/${video.model_id}`}
                    target="_blank"
                    className="model-link"
                  >
                    Model: {video.model_id}
                  </Link> */}
                  {/* <p className="video-meta">
                    {video.uploaded_at
                      ? new Date(video.uploaded_at).toLocaleDateString()
                      : ""}
                  </p> */}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {results.length > 0 && nextCursor && !loading && (
          <div className="load-more-wrapper">
            <button
              className="load-more-btn"
              onClick={() => fetchResults(latestQueryRef.current, false)}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
}
