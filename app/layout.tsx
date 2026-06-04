import type { Metadata, Viewport } from "next";
import "./globals.css";
 import ClientComponent from "./Components/ClientComponent";
import { Suspense } from 'react';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: {
    default: "Lustiie",
    template: "%s • Lustiie",
  },
  description:
    "Watch high-quality adult videos on Lustiie.com. Explore trending videos, popular performers, and thousands of free adult video pages updated regularly.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    title: "Lustiie • High-Quality Adult Videos",
    description:
      "Discover high-quality adult videos, trending content, and popular performers on Lustiie.com.",
    url: "https://lustiie.com",
    siteName: "Lustiie",
  },
  twitter: {
    card: "summary",
    title: "Lustiie • High-Quality Adult Videos",
    description:
      "Watch high-quality adult videos and discover trending content on Lustiie.com.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   <html lang="en">
      <body className="bg-neutral-950 text-zinc-100 antialiased">
            <Suspense fallback={<div>Loading...</div>}>
<Analytics/>
        <ClientComponent />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
