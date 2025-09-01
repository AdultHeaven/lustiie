import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';

const schema = z.object({
  targetType: z.enum(['thread','post']),
  targetId: z.number().int().positive(),
  reason: z.string().min(4).max(500),
});

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { error } = await supabase.from('reports').insert({
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reporter_id: user.id,
    reason: parsed.data.reason,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
