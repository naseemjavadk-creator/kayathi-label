import { publicClient, siteUrl, filterVisibleProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = siteUrl();
  const db = publicClient();
  const [{ data: products }, { data: cats }] = await Promise.all([
    db.from('products').select('name,sku,slug,category_id,subcategory_id,updated_at').eq('is_published', true),
    db.from('categories').select('id,slug,subcategories(id,slug)'),
  ]);
  const visibleProducts = filterVisibleProducts(products || []);
  const activeCatIds = new Set(visibleProducts.map((p) => p.category_id).filter(Boolean));
  const activeSubIds = new Set(visibleProducts.map((p) => p.subcategory_id).filter(Boolean));
  const fixed = [
    '',
    '/shop',
    '/new-arrivals',
    '/coming-soon',
    '/about',
    '/contact',
    '/play',
    '/faq',
    '/size-guide',
    '/shipping-returns',
    '/privacy-policy',
    '/terms',
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1.0 : 0.8 }));

  const categoryEntries = (cats || [])
    .filter((c) => activeCatIds.has(c.id))
    .flatMap((c) => [
      { url: `${base}/category/${c.slug}`, changeFrequency: 'weekly', priority: 0.9 },
      ...(c.subcategories || [])
        .filter((s) => activeSubIds.has(s.id))
        .map((s) => ({
          url: `${base}/category/${c.slug}?sub=${s.slug}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        })),
    ]);

  return [
    ...fixed,
    ...categoryEntries,
    ...visibleProducts.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'daily',
      priority: 0.8,
    })),
  ];
}
