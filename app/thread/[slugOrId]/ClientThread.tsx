"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowBigUp, ArrowBigDown, Eye, Clock, Send, Tag as TagIcon,
  ChevronDown, ChevronRight, Filter, Plus, BellPlus, MessageSquareMore
} from "lucide-react";

/* ---------- types ---------- */
type Thread = {
  id: number; slug: string; title: string; body: string; created_at: string; views?: number | null;
};
type Post = {
  id: number; thread_id: number; author_id: string; author_username?: string | null;
  parent_id: number | null; body: string; created_at: string; score: number; myVote: -1 | 0 | 1;
};
type SortMode = "top" | "recent" | "oldest" | "worst";

/* ---------- sort helper ---------- */
function sortList(arr: Post[], mode: SortMode): Post[] {
  const copy = [...arr];
  switch (mode) {
    case "top":    copy.sort((a,b)=>(b.score-a.score)||(+new Date(b.created_at)-+new Date(a.created_at))); break;
    case "recent": copy.sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at)); break;
    case "oldest": copy.sort((a,b)=>+new Date(a.created_at)-+new Date(b.created_at)); break;
    case "worst":  copy.sort((a,b)=>(a.score-b.score)||(+new Date(b.created_at)-+new Date(a.created_at))); break;
  }
  return copy;
}

/* ---------- main thread page ---------- */
export default function ClientThread({
  initialThread,
  initialTags,
  initialFollowerCount,
  initialFollowing,
  initialQuery,
  initialPosts = [],
}: {
  initialThread: Thread;
  initialTags: string[];
  initialFollowerCount: number;
  initialFollowing: boolean;
  initialQuery: { sort: string; page: number; expand: string };
  initialPosts?: Post[];
}) {
  const [thread, setThread] = useState<Thread>(initialThread);
  const [tags] = useState<string[]>(initialTags);

  // posts
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loadingPosts, setLoadingPosts] = useState(initialPosts.length === 0);
  const [fetchingMore, setFetchingMore] = useState(false);

  // sort + paging
  const [sort, setSort] = useState<SortMode>(
    ["top","recent","oldest","worst"].includes(initialQuery.sort) ? (initialQuery.sort as SortMode) : "top"
  );
  const [page, setPage] = useState(Math.max(1, initialQuery.page || 1));
  const PAGE_SIZE = 10;

  // follow state
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [followBusy, setFollowBusy] = useState(false);

  // main composer
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  // inline reply
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingToAuthor, setReplyingToAuthor] = useState<string | null>(null);

  // collapsed state
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  /* ---------- background fetch: merge full thread ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (initialPosts.length > 0) {
        setFetchingMore(true); // background refresh
      } else {
        setLoadingPosts(true); // cold start
      }

      const r = await fetch(`/api/thread/${encodeURIComponent(thread.slug)}`);
      const j = await r.json();
      if (cancelled) return;

      if (r.ok) {
        setThread(j.thread);
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const merged = [...prev];
          for (const p of (j.posts ?? [])) {
            if (!existingIds.has(p.id)) merged.push(p);
          }
          return merged;
        });
        const roots = (j.posts as Post[] | undefined)?.filter(p => p.parent_id == null) ?? [];
        setCollapsed(new Set(roots.map(rp => rp.id)));
      }

      setLoadingPosts(false);
      setFetchingMore(false);
    })();
    return () => { cancelled = true; };
  }, [thread.slug]);

  /* ---------- build tree ---------- */
  const { roots, childrenMap } = useMemo(() => {
    const childrenMap = new Map<number, Post[]>();
    const roots: Post[] = [];
    for (const p of posts) {
      if (p.parent_id == null) roots.push(p);
      else {
        const list = childrenMap.get(p.parent_id) ?? [];
        list.push(p);
        childrenMap.set(p.parent_id, list);
      }
    }
    return { roots, childrenMap };
  }, [posts]);

  /* ---------- sorted + paginated roots ---------- */
  const sortedRoots = useMemo(() => sortList(roots, sort), [roots, sort]);
  const totalPages = Math.max(1, Math.ceil(sortedRoots.length / PAGE_SIZE));
  const pagedRoots = sortedRoots.slice(0, PAGE_SIZE * page);

  /* ---------- actions ---------- */
  async function vote(postId: number, next: -1 | 0 | 1) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const prevVote = p.myVote;
      const newVote = next === prevVote ? 0 : next;
      const delta = newVote - prevVote;
      return { ...p, myVote: newVote, score: p.score + delta };
    }));
    const r = await fetch("/api/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId,value:next})});
    if (!r.ok) return;
    const j = await r.json();
    setPosts(prev => prev.map(p => p.id===postId ? {...p, score:j.score, myVote:j.myVote} : p));
  }

  async function toggleFollow(next: boolean) {
    if (followBusy) return;
    setFollowBusy(true);
    setFollowing(next);
    setFollowerCount(c => c + (next ? 1 : -1));
    const r = await fetch("/api/thread/follow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({threadId:thread.id,follow:next})});
    if (!r.ok) {
      setFollowing(!next);
      setFollowerCount(c => c + (next ? -1 : 1));
    }
    setFollowBusy(false);
  }

  function startReplyTo(post: Post) {
    setReplyToId(post.id);
    setReplyText("");
    setReplyingToAuthor(post.author_username ?? "user");
  }
  async function submitRootReply() {
    if (!body.trim()) return;
    setSending(true);
    const r = await fetch("/api/post",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({threadId:thread.id,body})});
    setSending(false);
    if (!r.ok) return;
    setBody("");
    const rr = await fetch(`/api/thread/${encodeURIComponent(thread.slug)}`);
    const jj = await rr.json(); if (rr.ok) setPosts(jj.posts ?? []); 
  }
  async function submitChildReply() {
    if (!replyText.trim() || !replyToId) return;
    const r = await fetch("/api/post",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({threadId:thread.id,body:replyText,parentId:replyToId})});
    if (!r.ok) return;
    setReplyText("");
    setReplyToId(null);
    setReplyingToAuthor(null);
    const rr = await fetch(`/api/thread/${encodeURIComponent(thread.slug)}`);
    const jj = await rr.json(); if (rr.ok) setPosts(jj.posts ?? []); 
  }
  function cancelReply() { setReplyToId(null); setReplyText(""); setReplyingToAuthor(null); }

  function toggleCollapsed(id:number) { setCollapsed(prev=>{const nx=new Set(prev);nx.has(id)?nx.delete(id):nx.add(id);return nx;}); }
  function expandAll(){ setCollapsed(new Set()); }
  function collapseAllRoots(){ setCollapsed(new Set(pagedRoots.map(r=>r.id))); }

  const createdAt = new Date(thread.created_at).toLocaleString();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 text-neutral-100">
      {/* HEADER */}
      <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-6">
        <div className="mb-2 text-[11px] text-neutral-500">Home / Threads</div>
        <h1 className="text-[26px] font-semibold leading-tight">{thread.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1">
            <Clock className="h-3.5 w-3.5" /> {createdAt}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1">
            <Eye className="h-3.5 w-3.5" /> {(thread.views ?? 0).toLocaleString()} views
          </span>
          {tags.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1">
              <TagIcon className="h-3.5 w-3.5" />
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <Link key={t} href={`/l/search?q=%23${encodeURIComponent(t)}`} className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-200 hover:bg-neutral-700">{t}</Link>
                ))}
              </div>
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={() => toggleFollow(!following)}
            disabled={followBusy}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
              following ? "border-fuchsia-700/40 bg-fuchsia-600/20 text-fuchsia-200" : "border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <BellPlus className="h-4 w-4" />
            {following ? "Following" : "Follow"}
            <span className="rounded bg-neutral-800 px-2 py-[2px] text-[11px] text-neutral-300">{followerCount}</span>
          </button>
        </div>
        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-[14px] leading-7">{thread.body}</div>
      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300">
          <Filter className="h-4 w-4" /><span>Sort</span>
          <select value={sort} onChange={e => { setSort(e.target.value as SortMode); setPage(1); }} className="bg-transparent text-neutral-100 outline-none">
            <option value="top">Top rated</option>
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="worst">Least rated</option>
          </select>
        </div>
        <button onClick={expandAll} className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-900">Expand all</button>
        <button onClick={collapseAllRoots} className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-900">Collapse all</button>
        <div className="ml-auto text-xs text-neutral-500">Showing {Math.min(pagedRoots.length, sortedRoots.length)} of {sortedRoots.length} top-level replies</div>
      </div>

      {/* REPLIES */}
      <section className="mt-4">
        {loadingPosts && <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">Loading replies…</div>}
        {!loadingPosts && pagedRoots.length === 0 && <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">Be the first to reply.</div>}
        {!loadingPosts && pagedRoots.length > 0 && (
          <div className="space-y-3">
            {pagedRoots.map(root => (
              <CommentNode key={root.id} post={root} depth={0} childrenMap={childrenMap} sort={sort}
                collapsed={collapsed} onToggle={toggleCollapsed} onVote={vote} onReply={startReplyTo}
                replyToId={replyToId} replyText={replyText} setReplyText={setReplyText}
                submitChildReply={submitChildReply} cancelReply={cancelReply} replyingToAuthor={replyingToAuthor}/>
            ))}
          </div>
        )}
        {fetchingMore && (
          <div className="mt-4 text-center text-xs text-neutral-400">⏳ Loading more replies…</div>
        )}
        {page < totalPages && (
          <div className="mt-4 flex justify-center">
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900">
              <Plus className="h-4 w-4"/> Show more replies
            </button>
          </div>
        )}
      </section>

      {/* MAIN COMPOSER */}
      <section className="mt-8 rounded-xl border border-neutral-800/70 bg-neutral-950/70 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-300">Write a reply</h3>
        </div>
        <textarea value={body} onChange={e=>setBody(e.target.value)}
          className="h-28 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm outline-none focus:border-neutral-700"
          placeholder="Keep it civil. Text only. No images or embeds." maxLength={10000}/>
        <div className="mt-3 flex items-center justify-end">
          <button onClick={submitRootReply} disabled={sending||!body.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Send className="h-4 w-4"/>{sending ? "Posting…" : "Reply"}
          </button>
        </div>
      </section>
    </main>
  );
}

/* ---------- recursive comment node ---------- */
function CommentNode({...props}: any) {
  const { post, depth, childrenMap, sort, collapsed,
    onToggle, onVote, onReply,
    replyToId, replyText, setReplyText, submitChildReply, cancelReply, replyingToAuthor } = props;

  const children = useMemo(()=>sortList(childrenMap.get(post.id) ?? [], sort),[childrenMap,post.id,sort]);
  const isCollapsed = collapsed.has(post.id);
  const hasKids = children.length > 0;

  return (
    <div className={`rounded-xl border border-neutral-800/70 bg-neutral-950/50 p-4 ${depth>0?"mt-3":""}`}>
      <PostRow post={post} onVote={onVote} onReply={()=>onReply(post)} compact={depth>0}/>
      {replyToId===post.id && (
        <div className={`${depth>0?"mt-2 ml-10":"mt-2"}`}>
          <InlineReply value={replyText} onChange={setReplyText} onCancel={cancelReply} onSend={submitChildReply}
            hint={replyingToAuthor?`Replying to ${replyingToAuthor}`:undefined}/>
        </div>
      )}
      {hasKids && (
        <>
          <button onClick={()=>onToggle(post.id)} className={`${depth>0?"mt-2 ml-10":"mt-2"} inline-flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-900`}>
            {isCollapsed?<ChevronRight className="h-3.5 w-3.5"/>:<ChevronDown className="h-3.5 w-3.5"/>}
            {isCollapsed?`Show ${children.length} replies`:"Hide replies"}
          </button>
          {!isCollapsed && (
            <div className="mt-3 ml-10 border-l border-neutral-800 pl-4">
              {children.map((child: Post)=>( 
                <CommentNode key={child.id} post={child} depth={depth+1} childrenMap={childrenMap} sort={sort}
                  collapsed={collapsed} onToggle={onToggle} onVote={onVote} onReply={onReply}
                  replyToId={replyToId} replyText={replyText} setReplyText={setReplyText}
                  submitChildReply={submitChildReply} cancelReply={cancelReply} replyingToAuthor={replyingToAuthor}/>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- leaf UI ---------- */
function PostRow({post,onVote,onReply,compact=false}:{post:Post;onVote:(id:number,v:-1|0|1)=>void;onReply:()=>void;compact?:boolean;}) {
  return (
    <article className="grid grid-cols-[42px_1fr] gap-3 sm:grid-cols-[54px_1fr]">
      <div className="flex flex-col items-center gap-1">
        <button onClick={()=>onVote(post.id,1)} className={`h-8 w-8 flex items-center justify-center rounded-lg ring-1 ring-neutral-800 hover:bg-neutral-900/70 ${post.myVote===1?"text-fuchsia-400 ring-fuchsia-500/40":"text-neutral-300"}`}><ArrowBigUp className="h-5 w-5"/></button>
        <div className="px-2 py-0.5 rounded bg-neutral-900/70 text-xs font-semibold text-neutral-100">{post.score}</div>
        <button onClick={()=>onVote(post.id,-1)} className={`h-8 w-8 flex items-center justify-center rounded-lg ring-1 ring-neutral-800 hover:bg-neutral-900/70 ${post.myVote===-1?"text-sky-400 ring-sky-500/40":"text-neutral-300"}`}><ArrowBigDown className="h-5 w-5"/></button>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span className="rounded bg-neutral-900/70 px-2 py-0.5 text-neutral-300">{post.author_username||"user"}</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div className={`mt-1 whitespace-pre-wrap text-neutral-200 ${compact?"text-[13px] leading-6":"text-[14px] leading-7"}`}>{post.body}</div>
        <div className="mt-2"><button onClick={onReply} className="inline-flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-900"><MessageSquareMore className="h-3.5 w-3.5"/>Reply</button></div>
      </div>
    </article>
  );
}

function InlineReply({value,onChange,onCancel,onSend,hint}:{value:string;onChange:(v:string)=>void;onCancel:()=>void;onSend:()=>void;hint?:string;}) {
  return (
    <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950/50 p-3">
      {hint && <div className="mb-2 text-[11px] text-neutral-400">{hint}</div>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} className="h-24 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm outline-none focus:border-neutral-700" placeholder="Reply to this message…"/>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded border border-neutral-800 text-xs text-neutral-300 hover:bg-neutral-900/70">Cancel</button>
        <button onClick={onSend} disabled={!value.trim()} className="inline-flex items-center gap-1 rounded bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"><Send className="h-3.5 w-3.5"/>Reply</button>
      </div>
    </div>
  );
}
