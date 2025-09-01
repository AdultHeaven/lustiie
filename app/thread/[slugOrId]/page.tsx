// app/t/[slugOrId]/page.tsx
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import ClientThread from "./ClientThread";

export const dynamic = "force-dynamic"; // or export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: { slugOrId: string } }
): Promise<Metadata> {
  const supabase = supabaseServer();
  const isId = /^\d+$/.test(params.slugOrId);

  const { data: thread } = await supabase
    .from("threads")
    .select("id,slug,title,body,created_at,views,is_deleted")
    .eq(isId ? "id" : "slug", isId ? Number(params.slugOrId) : params.slugOrId)
    .maybeSingle();

  const canonical = thread?.slug
    ? `https://lustiie.com/t/${thread.slug}`
    : `https://lustiie.com/t/${encodeURIComponent(params.slugOrId)}`;

  if (!thread || thread.is_deleted) {
    return {
      title: "Thread not found • Lustiie",
      description: "This thread could not be found.",
      robots: { index: false, follow: false },
      alternates: { canonical },
      openGraph: {
        type: "website",
        title: "Thread not found • Lustiie",
        description: "This thread could not be found.",
        url: canonical,
        siteName: "Lustiie",
      },
      twitter: {
        card: "summary",
        title: "Thread not found • Lustiie",
        description: "This thread could not be found.",
      },
    };
  }

  // tags
  const [{ data: ttags }, { data: allTags }] = await Promise.all([
    supabase.from("thread_tags").select("tag_id").eq("thread_id", thread.id),
    supabase.from("tags").select("id,name"),
  ]);
  const tagIds = new Set((ttags ?? []).map(r => r.tag_id));
  const tagNames = (allTags ?? []).filter(t => tagIds.has(t.id)).map(t => t.name);

  const raw = (thread.body ?? "").replace(/\s+/g, " ").trim();
  const descBase = raw || "Text-only adult discussion on Lustiie.";
  const description = descBase.length > 180 ? descBase.slice(0, 177) + "…" : descBase;

  const title = `${thread.title} • Lustiie`;
  const og = `https://lustiie.com/api/og/thread?title=${encodeURIComponent(thread.title)}&slug=${encodeURIComponent(thread.slug)}`;

  return {
    title,
    description,
    keywords: Array.from(new Set([
      "Lustiie", "adult discussion", "text-only forum", "uncensored conversations", ...tagNames,
    ])),
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "Lustiie",
      publishedTime: thread.created_at ?? undefined,
      images: [og],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { slugOrId: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = supabaseServer();

  // redirect numeric IDs → slug canonical
  const isId = /^\d+$/.test(params.slugOrId);
  if (isId) {
    const { data: found } = await supabase
      .from("threads")
      .select("slug")
      .eq("id", Number(params.slugOrId))
      .maybeSingle();
    if (found?.slug) redirect(`/t/${found.slug}`);
  }

  // fetch thread
  const { data: thread } = await supabase
    .from("threads")
    .select("id,slug,title,body,created_at,views")
    .eq("slug", params.slugOrId)
    .maybeSingle();
  if (!thread) return notFound();

  // tags
  const [{ data: ttags }, { data: allTags }] = await Promise.all([
    supabase.from("thread_tags").select("tag_id").eq("thread_id", thread.id),
    supabase.from("tags").select("id,name"),
  ]);
  const tagIds = new Set((ttags ?? []).map(r => r.tag_id));
  const tags = (allTags ?? []).filter(t => tagIds.has(t.id)).map(t => t.name);

  // follower count + whether current user follows
  const [{ count }, me] = await Promise.all([
    supabase.from("follows")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", thread.id),
    supabase.auth.getUser(),
  ]);
  let following = false;
  if (me.data.user) {
    const { data: mine } = await supabase
      .from("follows")
      .select("id")
      .eq("thread_id", thread.id)
      .eq("user_id", me.data.user.id)
      .maybeSingle();
    following = !!mine;
  }

  // grab a first slice of posts (SSR snapshot, not final)
  const sort = (searchParams?.sort as string) || "top";
  const PAGE_SIZE = 5; // deliberately small, feels like “preview”

  let query = supabase.from("posts").select(`
    id,
    thread_id,
    author_id,
    parent_id,
    body,
    created_at,
    profiles:author_id ( username )
  `).eq("thread_id", thread.id);

  if (sort === "recent") query = query.order("created_at", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data: rawPosts } = await query.limit(PAGE_SIZE);

  const initialPosts = (rawPosts ?? []).map((p: any) => ({
    id: p.id,
    thread_id: p.thread_id,
    author_id: p.author_id,
    author_username: Array.isArray(p.profiles)
      ? p.profiles[0]?.username ?? "user"
      : p.profiles?.username ?? "user",
    parent_id: p.parent_id,
    body: p.body,
    created_at: p.created_at?.toString(),
    score: 0,
    myVote: 0 as -1 | 0 | 1,
  }));

  return (
<ClientThread
  initialThread={thread}
  initialTags={tags}
  initialFollowerCount={count ?? 0}
  initialFollowing={following}
  initialQuery={{
    sort,
    page: Number(searchParams?.page || "1"),
    expand: (searchParams?.expand as string) || "",
  }}
  initialPosts={initialPosts}
/>

  );
}
