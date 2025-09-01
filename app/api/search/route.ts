// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

type ThreadRow = {
  id: number;
  slug: string;
  title: string;
  body: string | null;
  created_at: string | null;
  views: number | null;
  model_id: number | null;
};

export async function POST(req: Request) {
  const { q } = await req.json().catch(() => ({ q: '' }));
  const query: string = (q ?? '').trim();
  if (!query) return NextResponse.json({ models: [], threads: [], tags: [] });

  const supabase = supabaseServer();

  const isTag = query.startsWith('#');
  const tagTerm = isTag ? query.slice(1).trim() : '';

  // buckets we’ll fill
  let threads: Array<any> = [];
  let models: Array<any> = [];
  let tags: Array<{ id: number; name: string }> = [];

  if (isTag && tagTerm) {
    // 1) find matching tags
    const { data: tagRows } = await supabase
      .from('tags')
      .select('id,name')
      .ilike('name', `%${tagTerm}%`)
      .limit(25);

    tags = tagRows ?? [];
    const tagIds = (tagRows ?? []).map(t => t.id);
    if (tagIds.length === 0) {
      return NextResponse.json({ models: [], threads: [], tags: [] });
    }

    // 2) thread_ids via thread_tags
    const { data: ttags } = await supabase
      .from('thread_tags')
      .select('thread_id,tag_id')
      .in('tag_id', tagIds)
      .limit(1000);

    const threadIds = Array.from(new Set((ttags ?? []).map(r => r.thread_id)));
    if (threadIds.length === 0) {
      return NextResponse.json({ models: [], threads: [], tags });
    }

    // 3) threads
    const { data: threadRows } = await supabase
      .from('threads')
      .select('id,slug,title,body,created_at,views,model_id')
      .in('id', threadIds)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false })
      .limit(200);

    const threadList: ThreadRow[] = threadRows ?? [];

    // 4) reply counts (for those threads)
    const { data: posts } = await supabase
      .from('posts')
      .select('id,thread_id')
      .in('thread_id', threadList.map(t => t.id));

    const counts = new Map<number, number>();
    for (const p of posts ?? []) counts.set(p.thread_id, (counts.get(p.thread_id) ?? 0) + 1);

    // 5) attach model display name (optional)
    const modelIds = Array.from(new Set(threadList.map(t => t.model_id).filter(Boolean))) as number[];
    const { data: modelsRows } = modelIds.length
      ? await supabase.from('models').select('id,display_name').in('id', modelIds)
      : { data: [] as any[] };

    const modelNameById = new Map<number, string>(
      (modelsRows ?? []).map(m => [m.id, m.display_name ?? ''])
    );

    threads = threadList.map(t => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      body: t.body,
      created_at: t.created_at,
      views: t.views ?? 0,
      replies: counts.get(t.id) ?? 0,
      models: t.model_id ? { display_name: modelNameById.get(t.model_id) } : null,
    }));
  } else {
    // NORMAL TEXT SEARCH (models + threads)
    const [modelsRes, threadsRes] = await Promise.all([
      supabase
        .from('models')
        .select('slug,display_name,bio,tags')
        .or(`display_name.ilike.%${query}%,slug.ilike.%${query}%`)
        .limit(10),

      supabase
        .from('threads')
        .select('id,slug,title,body,created_at,views,model_id')
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    models = modelsRes.data ?? [];
    const threadRows: ThreadRow[] = threadsRes.data ?? [];

    // reply counts
    const { data: posts } = await supabase
      .from('posts')
      .select('id,thread_id')
      .in('thread_id', threadRows.map(t => t.id));

    const counts = new Map<number, number>();
    for (const p of posts ?? []) counts.set(p.thread_id, (counts.get(p.thread_id) ?? 0) + 1);

    // model names
    const modelIds = Array.from(new Set(threadRows.map(t => t.model_id).filter(Boolean))) as number[];
    const { data: modelsRows } = modelIds.length
      ? await supabase.from('models').select('id,display_name').in('id', modelIds)
      : { data: [] as any[] };

    const modelNameById = new Map<number, string>(
      (modelsRows ?? []).map(m => [m.id, m.display_name ?? ''])
    );

    threads = threadRows.map(t => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      body: t.body,
      created_at: t.created_at,
      views: t.views ?? 0,
      replies: counts.get(t.id) ?? 0,
      models: t.model_id ? { display_name: modelNameById.get(t.model_id) } : null,
    }));

    // also surface tag hits if someone types with a '#'
    if (query.includes('#')) {
      const t = query.replace('#', '').trim();
      const { data: tagRows } = await supabase
        .from('tags')
        .select('id,name')
        .ilike('name', `%${t}%`)
        .limit(25);
      tags = tagRows ?? [];
    }
  }

  return NextResponse.json({ models, threads, tags });
}
