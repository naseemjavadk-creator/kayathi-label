import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const DEFAULT_SUPABASE_URL = 'https://srhhekxjnfnudzgqibwj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaGhla3hqbmZudWR6Z3FpYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDUzMzUsImV4cCI6MjEwOTM4MTMzNX0.5sZn_z1AFoBOvHv_uRZw5cZddl1t1xH7aYsY4nhFhcY';

// Server client that acts as the signed-in user, so database security rules apply to them.
export function createSupabaseServer() {
  const store = cookies();
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim(),
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(list) {
          try {
            const isProd = process.env.NODE_ENV === 'production';
            list.forEach(({ name, value, options }) =>
              store.set(name, value, {
                ...options,
                sameSite: options?.sameSite || 'lax',
                secure: isProd,
                path: options?.path || '/',
              })
            );
          } catch {
            /* called from a Server Component; middleware refreshes the session */
          }
        },
      },
    }
  );
}
