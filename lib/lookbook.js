import { publicClient, filterVisibleProducts } from '@/lib/data';
import { sortedImages } from '@/lib/images';
import { LOOKBOOK_CONFIG } from '@/config/lookbook';

const MAX_LOOKS = 10;

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
 * Builds the looks for the Runway Lookbook from config/lookbook.js and live Supabase products.
 * Returns [] when there is nothing to show, so callers can hide the section.
 */
export async function loadLookbook() {
  const cfg = LOOKBOOK_CONFIG;
  const perLook = Math.min(3, Math.max(1, cfg.productsPerLook || 3));
  const db = publicClient();

  const [{ data: rows }, { data: cats }] = await Promise.all([
    db
      .from('products')
      .select('id, name, slug, sku, price, original_price, stock, is_available, sizes, colours, category_id, is_featured, is_new, created_at, product_images(url,sort_order)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(500),
    db.from('categories').select('id, slug'),
  ]);

  const products = filterVisibleProducts(rows || []).filter((p) => (p.product_images || []).length);
  if (!products.length) return [];
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  // 1. Hand-picked looks from config.
  const manual = (cfg.looks || [])
    .map((look, i) => {
      const items = (look.products || []).map((s) => bySlug.get(s)).filter(Boolean).slice(0, perLook);
      const image = look.image || (items[0] && sortedImages(items[0])[0]?.url);
      if (!image) return null;
      return {
        id: `look-${i}`,
        image,
        alt: look.alt || (items[0] ? items[0].name : `${cfg.lookLabel} ${i + 1}`),
        shopUrl: items[0] ? `/product/${items[0].slug}` : null,
        products: items.map(toCard),
      };
    })
    .filter(Boolean)
    .slice(0, MAX_LOOKS);
  if (manual.length) return manual;

  // 2. Automatic looks: a lead piece (sarees first, in-stock and featured first) styled with other pieces.
  const leadCat = (cats || []).find((c) => c.slug === cfg.autoLeadCategory);
  const inStock = (p) => p.is_available && p.stock > 0;
  const rank = (p) => (inStock(p) ? 0 : 2) + (p.is_featured ? 0 : 1);
  const sorted = [...products].sort((a, b) => rank(a) - rank(b));
  let leads = leadCat ? sorted.filter((p) => p.category_id === leadCat.id) : [];
  if (!leads.length) leads = sorted;
  const count = Math.min(MAX_LOOKS, Math.max(1, cfg.autoLookCount || 6));
  leads = leads.slice(0, count);

  const leadIds = new Set(leads.map((p) => p.id));
  const companions = sorted.filter(
    (p) => !leadIds.has(p.id) && inStock(p) && (!leadCat || p.category_id !== leadCat.id)
  );

  let c = 0;
  return leads.map((lead, i) => {
    const items = [lead];
    for (let k = 0; k < perLook - 1 && companions.length; k++) {
      items.push(companions[c % companions.length]);
      c++;
    }
    const unique = [...new Map(items.map((p) => [p.id, p])).values()];
    return {
      id: `look-${lead.id}`,
      image: sortedImages(lead)[0].url,
      alt: lead.name,
      shopUrl: `/product/${lead.slug}`,
      products: unique.map(toCard),
    };
  });
}
