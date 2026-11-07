import { publicClient, siteUrl } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = siteUrl();
  const db = publicClient();
  const [{ data: products }, { data: cats }] = await Promise.all([
    db.from('products').select('slug,updated_at').eq('is_published', true),
    db.from('categories').select('slug'),
  ]);
  const fixed = ['', '/shop', '/new-arrivals', '/coming-soon', '/about', '/contact'].map((p) => ({ url: `${base}${p}` }));
  return [
    ...fixed,
    ...(cats || []).map((c) => ({ url: `${base}/category/${c.slug}` })),
    ...(products || []).map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updated_at })),
  ];
}
