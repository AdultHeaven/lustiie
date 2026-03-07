export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "sans-serif",
        textAlign: "center"
      }}
    >
      <div>
        <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>
          Welcome to Lustiie.com
        </h1>

        <p style={{ opacity: 0.8 }}>
          Discover and download the latest games.
        </p>
      </div>
    </main>
  );
}