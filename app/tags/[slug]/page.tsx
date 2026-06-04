"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";
import { useParams } from "next/navigation";

import "../../searchCSS.css";
import "../../gamePage.css";

type Video = {
  id: string;
  model_id: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  uploader_username?: string | null;
  uploaded_at?: string | null;
  video_name?: string | null;
};

export default function TagPage() {
  const PREVIEW_LIMIT = 12;
  const WORKER_BASE = "https://postgres-search.ahapi.workers.dev";

  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<any>(null);

  const abortRef = useRef<AbortController | null>(null);
  const latestTagRef = useRef<string>("");

  const params = useParams();
const tag = decodeURIComponent((params?.slug as string) || "");
  function normalizeResponse(data: any) {
    if (!data) return { rows: [], nextCursor: null, ok: false };

    if (data.ok !== undefined) {
      return {
        rows: data.rows ?? data.results ?? [],
        nextCursor: data.nextCursor ?? null,
        ok: data.ok,
      };
    }

    if (Array.isArray(data)) {
      return { rows: data, nextCursor: null, ok: true };
    }

    return { rows: [], nextCursor: null, ok: false };
  }

  async function fetchResults(reset = false) {
    if (!tag) return;

    if (abortRef.current) abortRef.current.abort();

    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    if (reset) {
      setResults([]);
      setNextCursor(null);
    }

    latestTagRef.current = tag;

    try {
      const params = new URLSearchParams();
      params.set("q", tag); // reuse same backend
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

  useEffect(() => {
    if (tag) fetchResults(true);
  }, [tag]);

  const fallbackThumb =
    "https://img202.imagetwist.com/th/71768/upobborof86g.jpg";

  return (
    <>

      <div className="search-page">
        {/* ✅ HEADER */}
        <div className="search-page-header">
          <h1 className="search-title">{tag}</h1>
          <p className="search-subtitle">Videos tagged with "{tag}"</p>
        </div>

        {/* ✅ RESULTS */}
        <div className="results-grid">
          {loading && results.length === 0 ? (
            <p className="results-message">Loading...</p>
          ) : (
            results.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 1.02 }}
                className="video-card"
              >
                <a
                  href={`/videos/${video.id}`}
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
                  </Link>

                  <p className="video-meta">
                    {video.uploaded_at
                      ? new Date(video.uploaded_at).toLocaleDateString()
                      : ""}
                  </p> */}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ✅ LOAD MORE */}
        {results.length > 0 && nextCursor && !loading && (
          <div className="load-more-wrapper">
            <button
              className="load-more-btn"
              onClick={() => fetchResults(false)}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
}