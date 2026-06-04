// app/videos/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../homePageCSS.css';
import '../gamePage.css';
import '../videos.css';


const VIDEOS_PER_PAGE = 12;

interface Video {
  id: string;
  model_id: string;
  video_url: string;
  thumbnail_url: string;
  uploader_username: string;
  uploader_rank: number;
  video_name: string;
  uploaded_at: string;
}

function getPageNumber(searchParams: { [key: string]: string | string[] | undefined }): number {
  const page = parseInt(String(searchParams.page || '1'), 10);
  return isNaN(page) || page < 1 ? 1 : page;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ✅ Fetch videos from your API (Cloudflare-cached, not Vercel)
async function fetchVideosFromAPI(page: number): Promise<Video[]> {
  const res = await fetch(`https://adultheaven.fun/api/latest?page=${page}`, {
    cache: 'no-store', // ❌ Vercel does not cache
  });

  if (!res.ok) {
    throw new Error('Failed to fetch videos from API');
  }

  return res.json();
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = getPageNumber(searchParams);
  const videos = await fetchVideosFromAPI(page);

  if (!videos.length && page > 1) {
    notFound();
  }

  const hasNextPage = videos.length > VIDEOS_PER_PAGE;
  const videosToDisplay = videos.slice(0, VIDEOS_PER_PAGE);

  return (
    <>
      <main className="videos-page">
        <h1 className="BlogTitle">
          {/* adultheaven<span className="FunHighlight">.fun</span> */}
        </h1>

        <div className="video-grid">
          {videosToDisplay.map((video) => (
            <div key={video.id} className="video-card">

  {/* 🔥 INTERNAL LINK (thumbnail) */}
  <Link href={`/video/${video.id}`} className="thumbnail-link">
    <img
      src={video.thumbnail_url}
      alt={video.video_name || 'Video thumbnail'}
      className="video-thumb"
      width={400}
      height={225}
      loading="lazy"
    />
  </Link>

  <div className="video-info">

    {/* 🔥 INTERNAL LINK (title) */}
    <Link href={`/video/${video.id}`}>
      <h3 className="video-title">
        {video.video_name || 'Video Content'}
      </h3>
    </Link>

    {/* MODEL */}
    {/* <div className="video-meta">
      <Link
        href={`/leaks/${video.model_id}`}
        className="model-link"
      >
        @{video.model_id}
      </Link>
    </div> */}

    {/* UPLOADER */}
    {/* <div className="uploader-meta">
      <Link
        href={`/profile/${video.uploader_username.toLowerCase()}`}
        className="uploader-link"
      >
      </Link>

      <span className="upload-date">
        {formatDate(video.uploaded_at)}
      </span>
    </div> */}

  </div>
</div>
          ))}
        </div>

<div className="videos-pagination-modern">

  {/* PREV */}

  {page > 1 && (
    <Link
      href={`/videos?page=${page - 1}`}
      className="vpm-arrow"
      aria-label="Previous page"
    >
      ‹
    </Link>
  )}

  {/* PAGE BEFORE */}

  {page > 1 && (
    <Link
      href={`/video?page=${page - 1}`}
      className="vpm-page"
    >
      {page - 1}
    </Link>
  )}

  {/* CURRENT */}

  <span className="vpm-page active">
    {page}
  </span>

  {/* NEXT PAGE */}

  {hasNextPage && (
    <Link
      href={`/video?page=${page + 1}`}
      className="vpm-page"
    >
      {page + 1}
    </Link>
  )}

  {/* NEXT ARROW */}

  {hasNextPage && (
    <Link
      href={`/video?page=${page + 1}`}
      className="vpm-arrow"
      aria-label="Next page"
    >
      ›
    </Link>
  )}

</div>
           {/* Footer Section */}
        <footer className="footer">
          <div className="footer-container">
            {/* Brand & Description */}
            <div className="footer-section">
              <img src="https://ads.storeflz.com/icon.png" alt="Brand Logo" className="footer-logo" />
            </div>

            {/* Navigation Links */}
            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
              <li><a href="../../dmca">DMCA</a></li>
                <li><a href="../../terms">Terms of Service</a></li>
                <li><a href="../../privacy-policy">Privacy policy</a></li>
              </ul>
            </div>

            {/* Social & Contact Info */}
    <div className="footer-section">
      <h4 className="footer-heading">lustiie</h4>
  
   <ul className="footer-links">
{/* <li><a href="https://mrporngeek.com" rel="nofollow">MrPornGeek</a></li> */}
      </ul>  
    </div>
          </div>

          <div className="footer-bottom">
            &copy; 2026 lustiie.com All rights reserved.
          </div>
        </footer>
      </main>
    </>
  );
}

