import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // ✅ Only run for routes we want to protect server-side
  const protectedPaths = ["/profile"];
  const url = req.nextUrl.clone();

  if (protectedPaths.some((p) => url.pathname.startsWith(p))) {
    // still enforce auth here if you want
    url.pathname = "/";
    url.searchParams.set("signin", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"], // ✅ removed /thread/new
};
