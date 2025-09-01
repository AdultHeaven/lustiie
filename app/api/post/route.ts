// app/api/post/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { sanitizeText } from '@/lib/sanitize';

export async function POST(req: Request) {
  const { threadId, body, parentId } = await req.json();
  if (!threadId || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clean = sanitizeText(body);
  const { error } = await supabase.from('posts').insert({
    thread_id: threadId,
    author_id: user.id,
    parent_id: parentId ?? null,
    body: clean
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
