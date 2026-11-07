import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// First line of defence for /admin. The database rules (RLS) are the real enforcement.
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  const onLogin = pathname.startsWith('/admin/login');
  const toLogin = (query = '') => NextResponse.redirect(new URL(`/admin/login${query}`, request.url));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return onLogin ? response : toLogin();

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) return onLogin ? response : toLogin('?error=forbidden');
  if (onLogin) return NextResponse.redirect(new URL('/admin', request.url));

  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
