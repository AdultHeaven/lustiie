import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  const { slugOrId } = await req.json();
  const supabase = supabaseServer();

  let thread: any = null;
  if (/^\d+$/.test(slugOrId)) {
    const { data } = await supabase.from('threads').select('*').eq('id', Number(slugOrId)).maybeSingle();
    thread = data;
  } else {
    const { data } = await supabase.from('threads').select('*').eq('slug', slugOrId).maybeSingle();
    thread = data;
  }
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: posts } = await supabase.from('posts').select('*').eq('thread_id', thread.id).order('created_at', { ascending: true });

  return NextResponse.json({ thread, posts: posts ?? [] });
}
