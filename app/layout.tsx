import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lustiie",
    template: "%s • Lustiie",
  },
  description:
    "Lustiie.com is an adult text-only forum for uncensored conversations. No images, no videos, no embeds — just respectful discussions, reviews, and community-driven insights.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    title: "Lustiie • Adult Discussion Forum",
    description:
      "Join Lustiie.com — an uncensored, text-only community for adult discussions. Respectful, SEO-friendly, and community-moderated.",
    url: "https://lustiie.com",
    siteName: "Lustiie",
  },
  twitter: {
    card: "summary",
    title: "Lustiie",
    description:
      "Adult text-only discussion forum. No images, no embeds — just open conversations.",
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
    <html lang="en" className="bg-neutral-950 text-neutral-100">
      <body className="min-h-screen">
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="border-t border-neutral-800/70">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">Lustiie</div>
              <p className="mt-2 text-sm text-neutral-400">
              An adult forum for open, uncensored discussions — text-only, community-moderated.
                            </p>
            </div>
            <div>
              <div className="text-sm font-semibold">Links</div>
              <ul className="mt-2 space-y-1 text-sm text-neutral-400">
                <li><a className="hover:underline" href="/threads">Threads</a></li>
                <li><a className="hover:underline" href="/l/rules">Rules</a></li>
                <li><a className="hover:underline" href="/l/contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Legal</div>
              <ul className="mt-2 space-y-1 text-sm text-neutral-400">
                <li><a className="hover:underline" href="/l/tos">Terms</a></li>
                <li><a className="hover:underline" href="/l/privacy">Privacy</a></li>
                <li><a className="hover:underline" href="/robots.txt">Robots</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800/70 py-4 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Lustiie. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
