// app/sitemap.xml/route.ts
import { supabaseServer } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseServer();

  // Fetch all slugs from threads (only not deleted)
  const { data: threads, error } = await supabase
    .from("threads")
    .select("slug, updated_at")
    .eq("is_deleted", false);

  if (error) {
    console.error("Sitemap fetch error:", error);
    return NextResponse.json({ error: "Failed to generate sitemap" }, { status: 500 });
  }

  // Base URL of your site
  const baseUrl = "https://lustiie.com";

  // Build XML
  const urls = (threads ?? [])
    .filter((t) => t.slug) // only valid slugs
    .map(
      (t) => `
    <url>
      <loc>${baseUrl}/thread/${encodeURIComponent(t.slug)}</loc>
      <lastmod>${t.updated_at ?? new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
