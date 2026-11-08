import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const DEFAULT_SUPABASE_URL = 'https://srhhekxjnfnudzgqibwj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaGhla3hqbmZudWR6Z3FpYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDUzMzUsImV4cCI6MjEwOTM4MTMzNX0.5sZn_z1AFoBOvHv_uRZw5cZddl1t1xH7aYsY4nhFhcY';

const isProd = process.env.NODE_ENV === 'production';

function applyAdminSecurityHeaders(res) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

// First line of defence for /admin. The database rules (RLS) are the real enforcement.
export async function middleware(request) {
  let response = applyAdminSecurityHeaders(NextResponse.next({ request }));

  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = applyAdminSecurityHeaders(NextResponse.next({ request }));
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              sameSite: options?.sameSite || 'lax',
              secure: isProd,
              path: options?.path || '/',
            })
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  const onLogin = pathname.startsWith('/admin/login');
  const toLogin = (query = '') =>
    applyAdminSecurityHeaders(NextResponse.redirect(new URL(`/admin/login${query}`, request.url)));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return onLogin ? response : toLogin();

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) return onLogin ? response : toLogin('?error=forbidden');
  if (onLogin) return applyAdminSecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));

  return response;
}

export const config = { matcher: ['/admin/:path*'] };
