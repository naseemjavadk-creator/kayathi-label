import { siteUrl } from '@/lib/data';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
