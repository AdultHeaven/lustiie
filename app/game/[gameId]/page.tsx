import { Client } from "pg";
import "../../gamePage.css";
import Script from "next/script";

export const dynamic = "force-dynamic";

async function fetchGameData(gameId: string) {

  const client = new Client({
    connectionString: process.env.NILE_POSTGRES_URL!,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {

    const result = await client.query(
      `SELECT * FROM games WHERE name = $1 LIMIT 1`,
      [gameId]
    );

    return result.rows[0] || null;

  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  } finally {
    await client.end();
  }
}

export async function generateMetadata(
  { params }: { params: { gameId: string } }
) {

  const gameData = await fetchGameData(params.gameId);

  if (!gameData) {
    return {
      title: "Game Not Found - GamesHeaven",
      description: "The requested game could not be found."
    };
  }

  const updateDate = gameData.update_time
    ? new Date(Number(gameData.update_time)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Date not available";

  const tags = gameData.tags?.join(", ") || "";

  return {
    title: `${gameData.main_name} (${gameData.version}) - Free Download`,
    description: `Download ${gameData.main_name}. Last updated on ${updateDate}. ${gameData.description}`,
    keywords: `${tags}, adult games, latest content`,
    openGraph: {
      title: `${gameData.main_name} (${gameData.version}) Free Download`,
      description: gameData.description,
      url: `https://gamesheaven.fun/games/${params.gameId}`,
      type: "website",
      images: [
        {
          url: gameData.icon || "https://gamesheaven.fun/logo.png",
          width: 1200,
          height: 630
        }
      ]
    }
  };
}

export default async function GamePage(
  { params }: { params: { gameId: string } }
) {

  const gameData = await fetchGameData(params.gameId);

  if (!gameData) {
    return <div>Game not found</div>;
  }

  const updateDate = gameData.update_time
    ? new Date(Number(gameData.update_time)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Date not available";

  return (
    <body>

      <Script
        strategy="lazyOnload"
        src="https://www.googletagmanager.com/gtag/js?id=G-E2EGWZSJFF"
      />

      <Script id="google-analytics" strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-E2EGWZSJFF');
        `}
      </Script>

      <div className="pirate-background s-pagewrap">

        <header className="pirate-header">
          <div className="logo">
            <h1>GamesHeaven.<span className="smaller-text">fun</span></h1>
          </div>

          <nav className="pirate-nav-menu">
            <span className="separator" />
            <a href="../" className="pirate-nav-link">HOME</a>
            <span className="separator" />
            <a href="../adult" className="pirate-nav-link">ADULT</a>
          </nav>

        </header>

        <div className="game-details-container">

          <header className="game-header">

            <h1 className="game-title-left">
              {gameData.main_name}
              <span className="game-version-small">
                ({gameData.version})
              </span>
            </h1>

            <p className="game-update-left">
              <span>Last Update: </span>{updateDate}
            </p>

          </header>

          <div className="game-details">

            {[
              { id: "description", label: "📝 Description", value: gameData.description },
              { id: "gameplay", label: "🕹️ Gameplay", value: gameData.gameplay },
              { id: "characters", label: "👩‍🎤 Characters", value: gameData.characters },
              { id: "platforms", label: "🌐 Platforms", value: gameData.platforms }
            ].map((section, index) => (

              <div key={section.id} className="game-section">

                <input
                  type="checkbox"
                  id={section.id}
                  defaultChecked={index === 0}
                />

                <label htmlFor={section.id}>{section.label}</label>

                <div className="content">
                  <p>{section.value || `No ${section.id} available.`}</p>
                </div>

              </div>

            ))}

          </div>

          <section className="screenshots-section">

            <ul className="screenshots-list">

              {gameData.screenshots?.length > 0 ? (

                gameData.screenshots.map((img: string, i: number) => (

                  <li key={i} className="screenshot-item">
                    <img src={img} alt={`Screenshot ${i + 1}`} />
                  </li>

                ))

              ) : (

                <li>No screenshots available.</li>

              )}

            </ul>

          </section>

          <section className="download-section">

            <h2>Download Options</h2>

            <div className="platform-buttons">

              {gameData.download_links?.map((link: string, i: number) => (

                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-button"
                >
                  Download
                </a>

              ))}

            </div>

          </section>

          <section className="developer-details">

            <h2 className="developer-title">Developer</h2>

            {gameData.dev_name ? (

              <a
                href={gameData.dev_link}
                target="_blank"
                rel="noopener noreferrer"
                className="developer-link"
              >
                {gameData.dev_name}
              </a>

            ) : (

              <p>No developer info</p>

            )}

          </section>

          <section className="tags-section">

            <h2 className="tags-title">Tags:</h2>

            <ul className="tags-list">

              {gameData.tags?.map((tag: string, i: number) => (

                <li key={i} className="tag-item">{tag}</li>

              ))}

            </ul>

          </section>

        </div>

      </div>

    </body>
  );
}