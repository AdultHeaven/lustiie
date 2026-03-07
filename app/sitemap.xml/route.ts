import { Client } from "pg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {

  const client = new Client({
    connectionString: process.env.NILE_POSTGRES_URL!,
    ssl: { rejectUnauthorized: false },
  });

  try {

    await client.connect();

    const result = await client.query(`
      SELECT name, update_time
      FROM games
      ORDER BY update_time DESC
    `);

    const baseUrl = "https://lustiie.com";

    const urls = result.rows
      .map(
        (game) => `
      <url>
        <loc>${baseUrl}/game/${encodeURIComponent(game.name)}</loc>
        <lastmod>${
          game.update_time
            ? new Date(Number(game.update_time)).toISOString()
            : new Date().toISOString()
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
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

  } catch (error) {

    console.error("Sitemap error:", error);

    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );

  } finally {

    await client.end();

  }
}