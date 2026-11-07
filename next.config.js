const host = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return null; }
})();

/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
