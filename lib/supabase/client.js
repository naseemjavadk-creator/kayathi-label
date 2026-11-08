import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://srhhekxjnfnudzgqibwj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaGhla3hqbmZudWR6Z3FpYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDUzMzUsImV4cCI6MjEwOTM4MTMzNX0.5sZn_z1AFoBOvHv_uRZw5cZddl1t1xH7aYsY4nhFhcY';

let client;
export function supabaseBrowser() {
  if (!client) {
    client = createBrowserClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim(),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim()
    );
  }
  return client;
}
