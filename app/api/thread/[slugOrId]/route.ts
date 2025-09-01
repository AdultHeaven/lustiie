// app/api/thread/[slugOrId]/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: { slugOrId: string } }
) {
  const supabase = supabaseServer();

  // find thread by id or slug
  let thread = null as any;
  if (/^\d+$/.test(params.slugOrId)) {
    const { data } = await supabase.from('threads').select('*').eq('id', Number(params.slugOrId)).maybeSingle();
    thread = data;
  } else {
    const { data } = await supabase.from('threads').select('*').eq('slug', params.slugOrId).maybeSingle();
    thread = data;
  }
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // tags (unchanged)
  const { data: tagRows } = await supabase
    .from('thread_tags')
    .select('tags(name)')
    .eq('thread_id', thread.id);
  const tags = (tagRows || []).map((r: any) => r.tags?.name).filter(Boolean);

  // posts with author username + current user vote & score
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, thread_id, author_id, parent_id, body, created_at,
      profiles:author_id ( username )
    `)
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true });

  // scores
  const { data: voteAgg } = await supabase
    .from('votes')
    .select('post_id, value');

  const scoreMap = new Map<number, number>();
  (voteAgg || []).forEach((v: any) => {
    scoreMap.set(v.post_id, (scoreMap.get(v.post_id) || 0) + (v.value ?? 0));
  });

  // (optional) current user's vote
  let myVotes = new Map<number, number>();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: mine } = await supabase
      .from('votes')
      .select('post_id, value')
      .eq('user_id', user.id);
    myVotes = new Map((mine || []).map((r: any) => [r.post_id, r.value]));
  }

  const hydrated = (posts || []).map((p: any) => ({
    id: p.id,
    thread_id: p.thread_id,
    author_id: p.author_id,
    author_username: p.profiles?.username ?? 'user',
    parent_id: p.parent_id,
    body: p.body,
    created_at: p.created_at,
    score: scoreMap.get(p.id) ?? 0,
    myVote: (myVotes.get(p.id) ?? 0) as -1 | 0 | 1
  }));

  return NextResponse.json({ thread, posts: hydrated, tags });
}
