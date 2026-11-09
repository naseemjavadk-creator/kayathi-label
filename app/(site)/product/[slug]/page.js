import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicClient, getSettings, sortedImages, siteUrl } from '@/lib/data';
import { inr } from '@/lib/format';
import { ALL_ATTRIBUTE_LABELS } from '@/lib/attributes';
import ProductGallery from '@/components/site/ProductGallery';
import OrderPanel from '@/components/site/OrderPanel';
import ProductRow from '@/components/site/ProductRow';

export const dynamic = 'force-dynamic';
const SEL = '*, product_images(url,sort_order), categories(name,slug), subcategories(name,slug)';

async function load(slug) {
  const { data } = await publicClient().from('products').select(SEL).eq('slug', slug).eq('is_published', true).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const p = await load(params.slug);
  if (!p) return { title: 'Product not found' };
  const raw = sortedImages(p)[0]?.url;
  // A small, resized copy of the photo for chat link previews (WhatsApp skips very large images).
  const img = raw ? `${siteUrl()}/_next/image?url=${encodeURIComponent(raw)}&w=1080&q=70` : undefined;
  const title = `${p.name} - ${inr(p.price)}`;
  const description = `${inr(p.price)}. ${(p.description || `${p.name} from KAYATHI LABEL`).slice(0, 130)}`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title, description, type: 'website', url: `/product/${p.slug}`, images: img ? [{ url: img, alt: p.name }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: img ? [img] : undefined },
  };
}

export default async function ProductPage({ params }) {
  const p = await load(params.slug);
  if (!p) notFound();
  const settings = await getSettings();
  const images = sortedImages(p);
  const soldOut = !p.is_available || p.stock <= 0;
  const attrs = Object.entries(p.attributes || {}).filter(([, v]) => v && String(v).trim());

  let related = [];
  if (p.category_id) {
    const { data } = await publicClient()
      .from('products')
      .select('*, product_images(url,sort_order)')
      .eq('is_published', true)
      .eq('category_id', p.category_id)
      .neq('id', p.id)
      .limit(4);
    related = data || [];
  }

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    description: p.description,
    image: images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'KAYATHI LABEL' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Number(p.price),
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${siteUrl()}/product/${p.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <div className="container-x py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-espresso/65">
          <Link href="/" className="hover:text-burgundy">Home</Link>
          {p.categories && (<> / <Link href={`/category/${p.categories.slug}`} className="hover:text-burgundy">{p.categories.name}</Link></>)}
          {p.subcategories && (<> / <Link href={`/category/${p.categories?.slug}?sub=${p.subcategories.slug}`} className="hover:text-burgundy">{p.subcategories.name}</Link></>)}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={images} name={p.name} />

          <div>
            <div className="flex flex-wrap gap-2 text-xs">
              {p.is_new && <span className="bg-gold px-2.5 py-1 text-burgundy">New arrival</span>}
              {p.is_featured && <span className="border border-burgundy px-2.5 py-1 text-burgundy">Featured</span>}
            </div>
            <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{p.name}</h1>
            <p className="mt-2 text-sm text-espresso/60">Product ID: {p.sku}</p>

            <p className="mt-5 text-3xl text-burgundy">
              {inr(p.price)}
              {p.original_price > p.price && (
                <>
                  <span className="ml-3 text-lg text-espresso/50 line-through">{inr(p.original_price)}</span>
                  <span className="ml-3 text-base text-burgundy">{p.discount_percent}% off</span>
                </>
              )}
            </p>

            <p className="mt-2 text-sm">
              {soldOut ? (
                <span className="text-burgundy">Out of stock</span>
              ) : p.stock <= (settings.low_stock_threshold || 3) ? (
                <span className="text-burgundy">Only {p.stock} left</span>
              ) : (
                <span className="text-espresso/70">In stock</span>
              )}
            </p>

            {p.description && <p className="mt-6 max-w-xl whitespace-pre-line leading-relaxed">{p.description}</p>}

            <OrderPanel
              product={{ name: p.name, sku: p.sku, price: p.price, sizes: p.sizes, colours: p.colours, stock: p.stock, is_available: p.is_available }}
              whatsapp={settings.whatsapp}
            />

            {attrs.length > 0 && (
              <dl className="mt-10 border-t border-espresso/15">
                {attrs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-espresso/10 py-3 text-sm">
                    <dt className="text-espresso/65">{ALL_ATTRIBUTE_LABELS[k] || k}</dt>
                    <dd className="whitespace-pre-line">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
      <ProductRow title="You may also like" products={related} />
    </>
  );
}
