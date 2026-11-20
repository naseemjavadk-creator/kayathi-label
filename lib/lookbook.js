import { publicClient, filterVisibleProducts } from '@/lib/data';
import { sortedImages } from '@/lib/images';
import { lookbookGroupKey, lookbookGroupsFromTaxonomy } from '@/lib/lookbookGroups';

function toCard(p) {
  const img = sortedImages(p)[0]?.url || null;
  const price = Number(p.price) || 0;
  const original = Number(p.original_price) || 0;
  return {
    id: p.id,
    sku: p.sku || p.id,
    slug: p.slug,
    name: p.name,
    price,
    originalPrice: original > price ? original : null,
    stock: p.stock,
    soldOut: !p.is_available || !(p.stock > 0),
    size: (p.sizes || [])[0] || '',
    colour: (p.colours || [])[0] || '',
    image: img,
  };
}

/**
 * The lookbook slides: one per category (Rings, Chains, Earrings, Bracelets, each saree
 * type…), each listing every published product in that category. Never mixed.
 * Categories with no products are left out, so new ones appear as products are added.
 * The owner can set each slide's model photo, order and visibility at /admin/lookbook.
 */
export async function loadLookbook() {
  const db = publicClient();
  const [{ data: rows }, { data: cats }, saved] = await Promise.all([
    db
      .from('products')
      .select('id, name, slug, sku, price, original_price, stock, is_available, sizes, colours, category_id, subcategory_id, is_featured, created_at, product_images(url,sort_order)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(1000),
    db.from('categories').select('id, name, slug, sort_order, subcategories(id, name, slug, sort_order)'),
    // Owner settings per slide. If the table does not exist yet, this returns an error and is ignored.
    db.from('lookbook_looks').select('*'),
  ]);

  const products = filterVisibleProducts(rows || []).filter((p) => (p.product_images || []).length);
  if (!products.length) return [];

  // In stock and featured first, then newest.
  const inStock = (p) => p.is_available && p.stock > 0;
  const rank = (p) => (inStock(p) ? 0 : 2) + (p.is_featured ? 0 : 1);
  const byGroup = new Map();
  [...products]
    .sort((a, b) => rank(a) - rank(b))
    .forEach((p) => {
      const key = lookbookGroupKey(p);
      if (!key) return;
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key).push(p);
    });

  const settings = new Map((saved?.error ? [] : saved?.data || []).map((r) => [r.group_key, r]));
  const groups = lookbookGroupsFromTaxonomy(cats || []);
  const naturalOrder = new Map(groups.map((g, i) => [g.key, i]));

  return groups
    .filter((g) => byGroup.has(g.key))
    .filter((g) => settings.get(g.key)?.is_active !== false)
    .sort((a, b) => {
      const sa = settings.get(a.key)?.sort_order || 0;
      const sb = settings.get(b.key)?.sort_order || 0;
      // Slides the owner ordered come first, in their order; the rest follow the category order.
      if (sa && sb) return sa - sb;
      if (sa || sb) return sa ? -1 : 1;
      return naturalOrder.get(a.key) - naturalOrder.get(b.key);
    })
    .map((g) => {
      const items = byGroup.get(g.key);
      const s = settings.get(g.key);
      return {
        id: g.key,
        title: g.name,
        image: s?.image_url || sortedImages(items[0])[0].url,
        alt: s?.alt || g.name,
        shopUrl: g.href,
        products: items.map(toCard),
      };
    });
}
