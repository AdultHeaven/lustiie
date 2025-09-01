import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';

const schema = z.object({
  postId: z.number().int().positive(),
  value: z.number().int().refine(v => [-1, 0, 1].includes(v)), // 0 to clear vote
});

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { postId, value } = parsed.data;

  // read existing
  const { data: existing } = await supabase
    .from('votes')
    .select('value')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (value === 0) {
    // clear
    await supabase.from('votes').delete().eq('user_id', user.id).eq('post_id', postId);
  } else if (!existing) {
    await supabase.from('votes').insert({ user_id: user.id, post_id: postId, value });
  } else if (existing.value === value) {
    // same click = unvote
    await supabase.from('votes').delete().eq('user_id', user.id).eq('post_id', postId);
  } else {
    await supabase.from('votes').update({ value }).eq('user_id', user.id).eq('post_id', postId);
  }

  // return fresh score + myVote
  const { data: votes } = await supabase
    .from('votes')
    .select('value, user_id')
    .eq('post_id', postId);

  const score = (votes ?? []).reduce((s, v) => s + (v.value ?? 0), 0);
  const myVote = (votes ?? []).find(v => v.user_id === user.id)?.value ?? 0;

  return NextResponse.json({ ok: true, postId, score, myVote });
}
