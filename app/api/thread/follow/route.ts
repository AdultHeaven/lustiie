// app/api/thread/follow/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  const { threadId, follow } = await req.json();
  const supabase = supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });

  if (follow) {
    const { error } = await supabase
      .from('thread_follows')
      .insert({ thread_id: threadId, user_id: user.id });
    if (error && !/duplicate key/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else {
    const { error } = await supabase
      .from('thread_follows')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ following: !!follow });
}


export async function GET(req: Request) {
    const url = new URL(req.url);
    const threadId = Number(url.searchParams.get('threadId'));
    const supabase = supabaseServer();
  
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
  
    let following = false;
    if (user) {
      const { data } = await supabase
        .from('thread_follows')
        .select('id')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();
      following = !!data;
    }
  
    let followerCount = 0;
    const { data: cnt } = await supabase
      .from('thread_follow_counts')
      .select('follower_count')
      .eq('thread_id', threadId)
      .maybeSingle();
    followerCount = cnt?.follower_count ?? 0;
  
    return NextResponse.json({ following, followerCount });
  }