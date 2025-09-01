// app/api/threads/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

type SortMode = 'latest' | 'replies' | 'views' | 'active';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(5, Number(url.searchParams.get('pageSize') || '20')));
  const sort = (url.searchParams.get('sort') || 'latest') as SortMode;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = supabaseServer();

  // base query
  let q = supabase
    .from('threads')
    .select('id, slug, title, body, created_at, views', { count: 'exact' })
    .is('is_deleted', false);

  // sorting
  switch (sort) {
    case 'latest':
      q = q.order('created_at', { ascending: false });
      break;
    case 'views':
      q = q.order('views', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'active':
      // We'll compute active later (last reply time); initially keep newest threads
      q = q.order('updated_at', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'replies':
      // We’ll sort after we compute reply counts (client-side fallback)
      q = q.order('created_at', { ascending: false });
      break;
  }

  // page slice
  const { data: threads, error, count } = await q.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!threads) return NextResponse.json({ threads: [], total: 0, page, pageSize });

  const ids = threads.map((t) => t.id);
  if (ids.length === 0) {
    return NextResponse.json({ threads: [], total: count || 0, page, pageSize });
  }

  // reply counts + last reply time
  const { data: posts } = await supabase
    .from('posts')
    .select('thread_id, created_at')
    .in('thread_id', ids);

  const repliesByThread = new Map<number, number>();
  const lastReplyAtByThread = new Map<number, string>();
  posts?.forEach((p) => {
    repliesByThread.set(p.thread_id, (repliesByThread.get(p.thread_id) || 0) + 1);
    const prev = lastReplyAtByThread.get(p.thread_id);
    if (!prev || new Date(p.created_at) > new Date(prev)) {
      lastReplyAtByThread.set(p.thread_id, p.created_at);
    }
  });

  // tags per thread
  // If FK is set, this nested select works. If not, we’ll do two-step join.
  const { data: threadTags } = await supabase
    .from('thread_tags')
    .select('thread_id, tags(name)')
    .in('thread_id', ids);

  const tagMap = new Map<number, string[]>();
  (threadTags || []).forEach((row: any) => {
    const list = tagMap.get(row.thread_id) || [];
    if (row.tags?.name) list.push(row.tags.name);
    tagMap.set(row.thread_id, list);
  });

  // build result
  let rows = threads.map((t) => {
    const replies = repliesByThread.get(t.id) || 0;
    const last_reply_at = lastReplyAtByThread.get(t.id) || t.created_at;
    const tags = tagMap.get(t.id) || [];
    return { ...t, replies, last_reply_at, tags };
  });

  // apply server-side sort for modes depending on aggregates
  if (sort === 'replies') {
    rows = rows.sort((a, b) => b.replies - a.replies || +new Date(b.created_at) - +new Date(a.created_at));
  } else if (sort === 'active') {
    rows = rows.sort((a, b) => +new Date(b.last_reply_at) - +new Date(a.last_reply_at));
  }

  return NextResponse.json({
    threads: rows,
    total: count || rows.length,
    page,
    pageSize,
  });
}
