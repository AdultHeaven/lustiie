// app/api/thread/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';
import { sanitizeText } from '@/lib/sanitize';
import { revalidateTag } from 'next/cache';
import { TAGS } from '@/lib/cache';

const schema = z.object({
  title: z.string().min(4).max(180),
  body: z.string().min(10).max(8000),
  tags: z.array(z.string().min(1).max(30)).max(8).optional(),
});

function slugifyTitle(title: string) {
  const words = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const base = words.join('-').replace(/-+/g, '-').slice(0, 70) || 'thread'; // keep shorter to leave space
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${base}-${rand}`;
}


export async function POST(req: Request) {
  const supabase = supabaseServer();

  // Auth
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate body
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const title = parsed.data.title.trim();
  const body = sanitizeText(parsed.data.body);
  const tagList = Array.from(
    new Set((parsed.data.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean))
  ).slice(0, 8);

  // Create thread
  const slug = slugifyTitle(title);
  const {
    data: thread,
    error: tErr,
  } = await supabase
    .from('threads')
    .insert({
      title,
      slug,
      author_id: user.id,
      body,
    })
    .select('id, slug')
    .single();

  if (tErr || !thread) {
    return NextResponse.json({ error: tErr?.message || 'Failed to create thread' }, { status: 400 });
  }

  // Tags (optional)
  if (tagList.length > 0) {
    // Try to create any missing tags. If unique violation occurs, ignore it.
    const { error: insErr } = await supabase
      .from('tags')
      .insert(tagList.map((name) => ({ name })))
      .select('id, name'); // returns created rows in case you need them

    if (insErr && insErr.code !== '23505') {
      // If it's not a unique violation, bubble up
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    // Fetch tags by CASE-INSENSITIVE name (handles any legacy mixed-case rows)
    // Build an OR filter like: name.ilike.tag1,name.ilike.tag2,...
    const orFilter = tagList.map((n) => `name.ilike.${n}`).join(',');
    const {
      data: allTags,
      error: allErr,
    } = await supabase
      .from('tags')
      .select('id, name')
      .or(orFilter);

    if (allErr) {
      return NextResponse.json({ error: allErr.message }, { status: 400 });
    }

    if (allTags && allTags.length > 0) {
      const rows = allTags.map((t) => ({ thread_id: thread.id, tag_id: t.id }));
      const { error: linkErr } = await supabase.from('thread_tags').insert(rows);
      if (linkErr) {
        return NextResponse.json({ error: linkErr.message }, { status: 400 });
      }
    }
  }

  // Cache bust
  revalidateTag(TAGS.HOME);

  return NextResponse.json({ ok: true, thread });
}
