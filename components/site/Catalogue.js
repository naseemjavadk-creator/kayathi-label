import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicClient } from '@/lib/data';
import ProductCard from './ProductCard';

const clean = (s) => String(s || '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
const num = (v) => {
  const n = Number(v);
  return v !== undefined && v !== '' && Number.isFinite(n) && n >= 0 ? n : null;
};

function FilterForm({ basePath, cats, scopeCat, sp, colours, sizes }) {
  return (
    <form action={basePath} method="get" className="space-y-5">
      <div>
        <label className="label" htmlFor="q">Search by name</label>
        <input id="q" name="q" type="search" defaultValue={sp.q || ''} className="field" />
      </div>
      {basePath === '/shop' && (
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={sp.category || ''} className="field">
            <option value="">All categories</option>
            {cats.map((c) => (<option key={c.id} value={c.slug}>{c.name}</option>))}
          </select>
        </div>
      )}
      {scopeCat && scopeCat.subcategories?.length > 0 && (
        <div>
          <label className="label" htmlFor="sub">Type</label>
          <select id="sub" name="sub" defaultValue={sp.sub || ''} className="field">
            <option value="">All</option>
            {scopeCat.subcategories.map((s) => (<option key={s.id} value={s.slug}>{s.name}</option>))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="min">Min price (₹)</label>
          <input id="min" name="min" type="number" min="0" inputMode="numeric" defaultValue={sp.min || ''} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="max">Max price (₹)</label>
          <input id="max" name="max" type="number" min="0" inputMode="numeric" defaultValue={sp.max || ''} className="field" />
        </div>
      </div>
      {colours.length > 0 && (
        <div>
          <label className="label" htmlFor="colour">Colour</label>
          <select id="colour" name="colour" defaultValue={sp.colour || ''} className="field">
            <option value="">Any colour</option>
            {colours.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <label className="label" htmlFor="size">Size</label>
          <select id="size" name="size" defaultValue={sp.size || ''} className="field">
            <option value="">Any size</option>
            {sizes.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="sort">Sort by</label>
        <select id="sort" name="sort" defaultValue={sp.sort || ''} className="field">
          <option value="">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-primary">Apply</button>
        <Link href={basePath} className="text-sm text-burgundy underline-offset-4 hover:underline">Clear all</Link>
      </div>
    </form>
  );
}

export default async function Catalogue({ searchParams = {}, categorySlug = null, onlyNew = false, basePath, title, intro }) {
  const db = publicClient();
  const sp = searchParams;

  const { data: catData } = await db
    .from('categories')
    .select('id,name,slug,subcategories(id,name,slug,sort_order)')
    .order('sort_order');
  const cats = catData || [];

  const scopeSlug = categorySlug || sp.category || null;
  const scopeCat = scopeSlug ? cats.find((c) => c.slug === scopeSlug) || null : null;
  if (categorySlug && !scopeCat) notFound();
  const sub = scopeCat ? (scopeCat.subcategories || []).find((s) => s.slug === sp.sub) : null;

  const scoped = (q) => {
    q = q.eq('is_published', true);
    if (scopeCat) q = q.eq('category_id', scopeCat.id);
    if (onlyNew) q = q.eq('is_new', true);
    return q;
  };

  // Colour and size choices come from what is actually in this part of the catalogue.
  const { data: opts } = await scoped(db.from('products').select('colours,sizes,subcategory_id,is_available,stock'));
  const colours = [...new Set((opts || []).flatMap((o) => o.colours || []))].sort();
  const sizes = [...new Set((opts || []).flatMap((o) => o.sizes || []))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // A type (like Nose Pins) is listed only while it has at least one product in stock.
  const inStockSubs = new Set((opts || []).filter((o) => o.is_available && o.stock > 0).map((o) => o.subcategory_id));
  const view = scopeCat
    ? { ...scopeCat, subcategories: (scopeCat.subcategories || []).filter((s) => inStockSubs.has(s.id) || s.id === sub?.id) }
    : null;

  let query = scoped(db.from('products').select('*, product_images(url,sort_order)'));
  const q = clean(sp.q);
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  if (sub) query = query.eq('subcategory_id', sub.id);
  const min = num(sp.min);
  const max = num(sp.max);
  if (min !== null) query = query.gte('price', min);
  if (max !== null) query = query.lte('price', max);
  if (sp.colour) query = query.contains('colours', [clean(sp.colour)]);
  if (sp.size) query = query.contains('sizes', [clean(sp.size)]);
  if (sp.sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sp.sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  const products = data || [];
  const heading = title || scopeCat?.name || 'All collections';

  return (
    <div className="container-x py-10 md:py-14">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl">{heading}</h1>
        {intro && <p className="mt-3 max-w-2xl text-espresso/75">{intro}</p>}
        {view && view.subcategories.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            <li>
              <Link href={basePath} className={`border px-3 py-1.5 text-sm ${!sub ? 'border-burgundy bg-burgundy text-ivory' : 'border-espresso/25 hover:border-burgundy'}`}>All</Link>
            </li>
            {[...view.subcategories].sort((a, b) => a.sort_order - b.sort_order).map((s) => (
              <li key={s.id}>
                <Link href={`${basePath}?sub=${s.slug}`} className={`border px-3 py-1.5 text-sm ${sub?.id === s.id ? 'border-burgundy bg-burgundy text-ivory' : 'border-espresso/25 hover:border-burgundy'}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside>
          <details className="border border-espresso/20 bg-white p-4 lg:hidden">
            <summary className="cursor-pointer text-sm">Search and filter</summary>
            <div className="mt-4">
              <FilterForm basePath={basePath} cats={cats} scopeCat={view} sp={sp} colours={colours} sizes={sizes} />
            </div>
          </details>
          <div className="hidden lg:block">
            <FilterForm basePath={basePath} cats={cats} scopeCat={view} sp={sp} colours={colours} sizes={sizes} />
          </div>
        </aside>

        <div>
          <p className="mb-5 text-sm text-espresso/65" aria-live="polite">
            {products.length} {products.length === 1 ? 'piece' : 'pieces'}
          </p>
          {error ? (
            <p className="border border-burgundy/30 bg-white p-6">We could not load the collection right now. Please refresh the page in a moment.</p>
          ) : products.length === 0 ? (
            <div className="border border-espresso/15 bg-white p-8">
              <p className="font-serif text-2xl">Nothing matches yet</p>
              <p className="mt-2 text-espresso/75">Try removing a filter, or message us on WhatsApp and we will help you find what you need.</p>
              <Link href={basePath} className="btn btn-outline mt-5">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
              {products.map((p) => (<ProductCard key={p.id} p={p} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
