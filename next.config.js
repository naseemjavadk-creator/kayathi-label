const DEFAULT_SUPABASE_URL = 'https://srhhekxjnfnudzgqibwj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaGhla3hqbmZudWR6Z3FpYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDUzMzUsImV4cCI6MjEwOTM4MTMzNX0.5sZn_z1AFoBOvHv_uRZw5cZddl1t1xH7aYsY4nhFhcY';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const host = (() => {
  try { return new URL(supabaseUrl).hostname; } catch { return 'srhhekxjnfnudzgqibwj.supabase.co'; }
})();

/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim(),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: host
      ? [{ protocol: 'https', hostname: host, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
