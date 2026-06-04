import { Client } from "pg";
import Link from "next/link";
// import ClientComponent from "../../Components/ClientComponent";
import '../../gamePage.css';
import './video.css';

export const dynamic = "force-dynamic";
import Script from "next/script";
const TAG_LIST = [
  "video", "videos", "pics", "images", "collection",
  "full", "hd", "latest", "new", "ppv",

  // 🔹 PLATFORM / SOURCE
  "onlyfans", "leak", "leaked", "of",

  // 🔹 FORMAT / STYLE
  "pov", "vlog", "amateur", "homemade",
  "public", "solo", "couple", "threesome",
  "mmf", "ffm", "lesbian",

  // 🔹 ACTIONS (core)
  "blowjob", "bj", "deepthroat",
  "anal", "creampie", "cumshot",
  "fingering", "fucking",
  "dildo", "dildo play",
  "vibrator", "vibrator play",
  "squirt", "squirting",
  "footjob", "handjob",

  // 🔹 BODY FOCUS
  "boobs", "big boobs", "boobjob",
  "ass", "ass tease", "ass show",
  "pussy", "pussy closeup",
  "nipples", "nude", "nudes",

  // 🔹 THEMES / SCENES
  "strip", "striptease", "stripping",
  "tease", "teasing",
  "cosplay", "nurse",
  "shower", "bathroom", "beach",
  "hiking",

  // 🔹 FETISH / NICHE (from JSON)
  "bbc", "feet", "joI", "strapon",
  "toys", "milk", "oil",
  "bouncing boobs",

  // 🔹 RELATION TYPES
  "milf", "teen", "young", "college",

  // 🔹 MOOD / STYLE
  "hardcore", "romantic",
  "intense", "wild",

  // 🔹 EXTRA DERIVED (important from your data)
  "boobs show", "pussy show",
  "ass fingering", "anal joi",
  "xxx", "sex","pee","compilation",
];


// ---------------- PROMOTED MODELS DATA ----------------
// const promotedModels = [
//   {
//     name: 'bellapuffs',
//     image: 'https://cdna.adultheaven.fun/ads/01viral.PNG',
//     url: 'https://adultheaven.fun/model/bellapuffs',
//   },
//   {
//     name: 'kaylapufff',
//     image: 'https://cdna.adultheaven.fun//ads/avatar%20(1).jpg',
//     url: 'https://adultheaven.fun/model/kaylapufff',
//    }
//    //,
//   // {
//   //   name: 'Lina Rose',
//   //   image: 'https://simp6.cuckcapital.cr/images3/GZ3YJCxXIAE-Uqa9b385c23c700c35.jpg',
//   //   url: 'https://t.acust-9.com/384478/10396/0?aff_sub5=SF_006OG000004lmDN',
//   // }
//   ,
//   {
//     name: 'kacybumsy',
//     image: 'https://simp6.cuckcapital.cr/images4/IMG_9048_converted1bcfbc64cea855e0.webp',
//     url: 'https://adultheaven.fun/model/kacybumsy',
//   },
//   {
//     name: 'Gabby Epstein',
//     image:
//       'https://simp6.cuckcapital.cr/images/1122x1328_e1a837e5ca69c83a226964efc301043c.jpg',
//     url: 'https://adultheaven.fun/model/gabby-epstein',
//   }
// ];
// ---------------- PROMOTED MODELS DATA ----------------
const promotedModels = [
  {
    name: 'bellapuffs',
    image: 'https://cdna.adultheaven.fun/ads/01viral.PNG',
    url: 'https://onlyfans.com/bellapuffs/c941',
    offer: '80% OFF • 31 Days Premium Access',
  },
  {
    name: 'kaylapufff',
    image: 'https://cdna.adultheaven.fun//ads/avatar%20(1).jpg',
    url: 'https://onlyfans.com/kaylapufff/c505',
    offer: 'Limited-Time Free Access',
  },
  {
    name: 'kacybumsy',
    image: 'https://simp6.cuckcapital.cr/images4/IMG_9048_converted1bcfbc64cea855e0.webp',
    url: 'https://onlyfans.com/kacybumsy/c277',
    offer: '90% OFF • Unlock 31 Days Access',
  },
  {
    name: 'Gabby Epstein',
    image:
      'https://simp6.cuckcapital.cr/images/1122x1328_e1a837e5ca69c83a226964efc301043c.jpg',
    url: 'https://gabbyepstein.asldating1.com/384478/9293/35281?aff_sub=c276&source=adultheaven&aff_sub5=SF_006OG0000059Jjh',
    offer: 'Limited-Time Free Access',
  },
    {
      name: 'Mia Malkova',
      image:
        'https://simp6.cuckcapital.cr/images3/1325x1656_673dee415802ae0f117ef0e354d400715797e5c2048250ba.jpg',
      url: 'https://miamalkova.asldating1.com/384478/8828/32671?aff_sub=c600&source=adultheaven&aff_sub5=SF_006OG0000059Jjh',
      offer: '50% OFF For 31 Days Access',
    },
    {
      name: 'ShotsofSimone',
      image:
        'https://simp6.cuckcapital.cr/images4/Screenshot-2026-05-31-114654dd4f3d022a2abeeb.png',
      url: 'https://shotsofsimone.asldating1.com/384478/8837/32692?aff_sub=c663&source=adultheaven&aff_sub5=SF_006OG0000059Jjh',
    offer: 'Limited-Time Free Access',
    },
    {
      name: 'Sophie Dee',
      image:
        'https://simp6.cuckcapital.cr/images4/Screenshot-2026-05-31-114840acee9d4318ee50a1.png',
      url: 'https://sophiedeevip.asldating1.com/384478/9048/34735?aff_sub=c716&source=adultheaven&aff_sub5=SF_006OG0000059Jjh',
    offer: 'Limited-Time Free Access',
    },
];

// ---------------- RANDOM PICK FUNCTION ----------------
function getRandomPromotedModels(count = 8) {
  const shuffled = [...promotedModels].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const randomPromoted = getRandomPromotedModels(4);

function extractTags(title: string) {
  if (!title) return [];

  const t = title.toLowerCase();

  return TAG_LIST.filter(tag => t.includes(tag));
}


export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const client = new Client({
    connectionString: process.env.NILE_POSTGRES_URL!,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      `
      SELECT video_name, thumbnail_url, model_id
      FROM videos
      WHERE id = $1
      LIMIT 1;
      `,
      [params.id]
    );

    if (result.rows.length === 0) {
      return {
        title: "Video Not Found",
      };
    }

    const video = result.rows[0];

    const title = video.video_name || "Video";
    const image =
      video.thumbnail_url ||
      "https://adultheavenimg.b-cdn.net/pics/videoPic.svg";

    const url = `https://lustiie.com/video/${params.id}`;

    return {
      title: `${title} | Lustiie`,
      description: `Watch ${title} on Lutiie. Explore more content from this model.`,

      openGraph: {
        title,
        description: `Watch ${title}`,
        url,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description: `Watch ${title}`,
        images: [image],
      },
    };
  } catch (err) {
    return {
      title: "Video",
    };
  } finally {
    await client.end();
  }
}
function getSourceName(url: string) {
  if (!url) return "External";

  try {
    const host = new URL(url).hostname;

    if (host.includes("filester")) return "Filester";
    if (host.includes("pixel")) return "Pixeldrain";
    if (host.includes("gofile")) return "GoFile";
    if (host.includes("bunk")) return "Bunkrr";
    if (host.includes("storeflz")) return "StoreFlz";
    if (host.includes("small")) return "SmallFiles";
    if (host.includes("mega")) return "Mega";

    return "External";
  } catch {
    return "External";
  }
}

function getContentType(title: string) {
  const t = (title || "").toLowerCase();

  if (t.includes("collection")) return "collection";
  if (t.includes("pic") || t.includes("pics") || t.includes("image")) return "pics";

  return "video";
}

function getFallback(title: string) {
  const lower = (title || "").toLowerCase();

  if (lower.includes("coll")) return "https://adultheavenimg.b-cdn.net/pics/collectionPic.svg";
  if (lower.includes("mast") || lower.includes("fing")) return "https://adultheavenimg.b-cdn.net/pics/vagina.svg";
  if (lower.includes("lesb")) return "https://adultheavenimg.b-cdn.net/pics/lesbian.svg";
  if (lower.includes("pic")) return "https://adultheavenimg.b-cdn.net/pics/pics.svg";
  if (lower.includes("three")) return "https://adultheavenimg.b-cdn.net/pics/three.svg";
  if (lower.includes("four")) return "https://adultheavenimg.b-cdn.net/pics/four.svg";
  if (lower.includes("blow")) return "https://adultheavenimg.b-cdn.net/pics/lips.svg";
  if (lower.includes("strip")) return "https://adultheavenimg.b-cdn.net/pics/strip.svg";

  return "https://adultheavenimg.b-cdn.net/pics/videoPic.svg";
}
export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const client = new Client({
    connectionString: process.env.NILE_POSTGRES_URL!,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const videoQuery = `
      SELECT id, video_name, thumbnail_url, video_url, model_id, COALESCE(likes, 0) AS likes
      FROM videos
      WHERE id = $1
      LIMIT 1;
    `;

    const videoResult = await client.query(videoQuery, [id]);

    if (videoResult.rows.length === 0) {
      return <div className="video-page">Video not found</div>;
    }

    const video = videoResult.rows[0];

    const relatedQuery = `
      SELECT id, video_name, thumbnail_url
      FROM videos
      WHERE model_id = $1
        AND id != $2
        AND thumbnail_url IS NOT NULL
        AND thumbnail_url != ''
      ORDER BY uploaded_at DESC
      LIMIT 8;
    `;

    const relatedResult = await client.query(relatedQuery, [
      video.model_id,
      video.id,
    ]);

const allRelated = relatedResult.rows;
const sourceName = getSourceName(video.video_url);
const t = (video.video_name || "").toLowerCase();
const tags = extractTags(video.video_name).slice(0, 8);
const bongaLinks = [
  "https://bngprm.com/promo.php?type=direct_link&v=2&c=821745&page=popular_chat&g=female",
  "https://bngprm.com/promo.php?type=direct_link&v=2&c=821745&page=top_5_by_growth&g=female",
];

const randomBongaLink =
  bongaLinks[Math.floor(Math.random() * bongaLinks.length)];

const label =
  t.includes("collection")
    ? "Open Collection"
    : t.includes("pics")
    ? "Open Pics"
    : t.includes("pic") || t.includes("image")
    ? "Open Pic"
    : "Watch Full Video";
let related: any[] = [];

if (allRelated.length >= 8) {
  related = allRelated.slice(0, 8);
} else if (allRelated.length >= 4) {
  related = allRelated.slice(0, 4);
} else {
  related = []; // show none
}
    return (
    <>     
   {/* <CrakRevenuePopin />  */}

    <div className="video-page">
     <div className="video-hero">

{/* PREVIEW */}
<div className="modern-video-layout">

  <a
  href={video.video_url}
  target="_blank"
  rel="noopener noreferrer"
  className="modern-video-preview"
  aria-label={`Watch ${video.video_name}`}
>
  {video.thumbnail_url ? (
    <>
      <img
        src={video.thumbnail_url}
        alt={video.video_name}
        className="modern-video-thumb"
      />

      <div className="modern-video-gradient" />

      <div className="modern-video-top">
        <span className="modern-video-source">
          {sourceName}
        </span>

        <span className="modern-video-external">
          External
        </span>
      </div>
    </>
  ) : (
    <div className="modern-video-empty" />
  )}

  <div className="modern-video-center">
    <div className="modern-play-btn">
      ▶
    </div>

    <span className="modern-preview-text">
      Preview
    </span>
  </div>
</a>
  {/* CONTENT */}
  <div className="modern-video-content">

    <h1 className="modern-video-title">
      {video.video_name}
    </h1>

    <div className="modern-video-actions">

      <a
        href={video.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="modern-watch-btn"
      >
        <span className="modern-watch-icon">▶</span>

        {label}

        <span className="modern-watch-arrow">↗</span>
      </a>


      {/* <div className="modern-action-btn">
        <ShareButton title={video.video_name} />
      </div> */}

    </div>

  </div>

</div>
</div>
<a
  href="https://t.vlmai-1.com/384478/9022/38565?aff_sub5=SF_006OG000004lmDN"
  target="_blank"
  rel="noopener noreferrer"
  className="ah-mobile-premium-bar"
>
  <div className="ah-mobile-premium-inner">

    <div className="ah-mobile-live-badge">
      HOT
    </div>

    <div className="ah-mobile-text-area">
      <div className="ah-mobile-title">
        Get Your Perfect AI Girl
      </div>

      <div className="ah-mobile-description">
        Uncensored chat, selfies, voice & private roleplay.
      </div>
    </div>

    <div className="ah-mobile-button">
      Create Now
    </div>

  </div>
</a>



{tags.length > 0 && (
  <div className="related-tags">
    <div className="related-tags-title">Related Tags</div>

    <div className="related-tags-list">
      {tags.map((tag) => (
        <a
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="related-tag"
        >
          #{tag}
        </a>
      ))}
    </div>
  </div>
)}
        {/* PROMOTED MODELS */}
{/* <div className="promoted-section">
  <div className="promoted-header">
    <h2 className="section-title1">Best OnlyFans Offers</h2>
  </div>

  <div className="promoted-grid">
    {randomPromoted.map((model) => (
      <a
        key={model.url}
        href={model.url}
        target="_blank"
        rel="noopener noreferrer"
        className="promoted-card"
      >
        <img src={model.image} alt={model.name} />

        <div className="promoted-title">
          <span>{model.name}</span>
        </div>
      </a>
    ))}
  </div>
</div> */}


        {related.length > 0 && (
          <div className="related-section">
            {/* <h2 className="section-title1">More from this model</h2> */}
<div className="related-header">
  <h2 className="section-title1">Related Videos</h2>

  {/* <Link
    href={`/model/${video.model_id}`}
    className="view-model-btn"
  >
    View Model
  </Link> */}
</div>
            <div className="related-grid">
              {related.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/video/${item.id}`}
                  className="related-card"
                >
                  <img src={item.thumbnail_url} alt={item.video_name} />
                  <div className="related-title">
                    <span>{item.video_name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

{/* <div className="promoted-section">
  <div className="related-header">
    <h2 className="section-title1">Best OnlyFans Offers</h2>
     <Link
    href={`/best-offers`}
    className="view-model-btn"
  >
    View More
  </Link>
  </div>

  <div className="promoted-grid">
    {randomPromoted.map((model) => (
      <a
        key={model.url}
        href={model.url}
        target="_blank"
        rel="noopener noreferrer"
        className="promoted-card"
      >
        <div className="promoted-image-wrap">
          <img
            src={model.image}
            alt={model.name}
            className="promoted-image"
          />

          <div className="of-badge">
            <img
              src="https://simp6.cuckcapital.cr/images4/icons8-onlyfans-4808847d636c2954b08.png"
              alt="OnlyFans"
            />
          </div>

          <div className="promoted-overlay">
            <div className="promoted-name">
              {model.name}
            </div>

            <div className="promoted-offer">
              {model.offer}
            </div>
          </div>
        </div>
      </a>
    ))}
  </div>
</div> */}
{/* <Script
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
      />

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "4px 0",
        }}
      >
        <div className="mobile-stripchat-banner">
          <ins
            className="eas6a97888e2"
            data-zoneid="5928308"
          ></ins>
        </div>

        <div className="desktop-stripchat-banner">
          <ins
            className="eas6a97888e10"
            data-zoneid="5928310"
          ></ins>
        </div>
      </div>

      <Script id="adprovider-init" strategy="afterInteractive">
        {`
          (AdProvider = window.AdProvider || []).push({"serve": {}});
          (AdProvider = window.AdProvider || []).push({"serve": {}});
        `}
      </Script> */}

<footer className="footer">
  <div className="footer-container">
    {/* Brand */}
    <div className="footer-section">
      <img
        src="https://ads.storeflz.com/icon.png"
        alt="Brand Logo"
        className="footer-logo"
      />
    </div>

    {/* Quick Links */}
    <div className="footer-section">
      <h4 className="footer-heading">Quick Links</h4>

      <ul className="footer-links">
        <li>
          <a href="/terms">Terms of Service</a>
        </li>

        <li>
          <a href="/privacy-policy">Privacy Policy</a>
        </li> <li>
          <a href="/dmca">DMCA</a>
        </li>
      </ul>
    </div>

    {/* Support */}
    <div className="footer-section">
      <h4 className="footer-heading">lustiie.com</h4>

    </div>
  </div>

  <div className="footer-bottom">
    &copy; 2026 lustiie.com All rights reserved.
  </div>
</footer>

      </div>
      </>

    );
  } catch (err) {
    console.error("Error fetching video:", err);
    return <div className="video-page">Failed to load video</div>;
  } finally {
    await client.end();
  }
}
