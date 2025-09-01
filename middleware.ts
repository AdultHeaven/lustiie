import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ['/profile', '/thread/new'];
  if (protectedPaths.some(p => url.pathname.startsWith(p)) && !user) {
    url.pathname = '/';
    url.searchParams.set('signin', '1');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/thread/new'],
};
