import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';

const schema = z.object({ threadId: z.number().int().positive() });

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // call the definer function so anon can increment safely
  const { error } = await supabase.rpc('increment_thread_views', { p_thread_id: parsed.data.threadId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
