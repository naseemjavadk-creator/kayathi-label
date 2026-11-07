import { siteUrl } from '@/lib/data';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
