import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  publicClient,
  getSettings,
  sortedImages,
  siteUrl,
  filterVisibleProducts,
  isSampleProduct,
  isProductNew,
  hasRealDiscount,
} from '@/lib/data';
import { SHOW_SAMPLE_PRODUCTS } from '@/config/site';
import { inr } from '@/lib/format';
import { ALL_ATTRIBUTE_LABELS } from '@/lib/attributes';
import ProductGallery from '@/components/site/ProductGallery';
import OrderPanel from '@/components/site/OrderPanel';
import ProductRow from '@/components/site/ProductRow';

export const dynamic = 'force-dynamic';
const SEL = '*, product_images(url,sort_order), categories(name,slug), subcategories(name,slug)';

async function load(slug) {
  const { data } = await publicClient().from('products').select(SEL).eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!data) return null;
  if (!SHOW_SAMPLE_PRODUCTS && isSampleProduct(data)) return null;
  return data;
}

export async function generateMetadata({ params }) {
  const p = await load(params.slug);
  if (!p) return { title: 'Product not found' };
  const img = sortedImages(p)[0]?.url || `${siteUrl()}/brand/logo-on-burgundy.png`;
  const catName = p.categories?.name ? `${p.categories.name} — ` : '';
  const description = (
    p.description ||
    `Shop ${p.name} (${catName}${inr(p.price)}) at KAYATHI LABEL. Order directly on WhatsApp with delivery across India.`
  ).slice(0, 155);
  return {
    title: `${p.name} Online`,
    description,
    alternates: { canonical: `${siteUrl()}/product/${p.slug}` },
    openGraph: {
      title: `${p.name} | KAYATHI LABEL`,
      description,
      url: `${siteUrl()}/product/${p.slug}`,
      type: 'website',
      images: [{ url: img, alt: p.name }],
    },
    twitter: { card: 'summary_large_image', title: `${p.name} | KAYATHI LABEL`, description, images: [img] },
  };
}

export default async function ProductPage({ params }) {
  const p = await load(params.slug);
  if (!p) notFound();
  const settings = await getSettings();
  const images = sortedImages(p);
  const soldOut = !p.is_available || p.stock <= 0;
  const fewLeft = !soldOut && p.stock <= (settings.low_stock_threshold || 3);
  const isNew30d = Boolean(p.is_new) && isProductNew(p);
  const discounted = hasRealDiscount(p);
  const rawAttrs = p.attributes || {};
  const fabricOrMaterial = rawAttrs.fabric || rawAttrs.material || '';
  const sizeOrLength =
    rawAttrs.length ||
    (Array.isArray(p.sizes) && p.sizes.length ? p.sizes.join(', ') : '') ||
    rawAttrs.ring_type ||
    rawAttrs.dimensions ||
    rawAttrs.available_sets ||
    '';
  const colourList = Array.isArray(p.colours) && p.colours.length ? p.colours.join(', ') : '';
  const careText = rawAttrs.care || 'Store in a dry pouch away from direct perfume or moisture.';

  const extraAttrs = Object.entries(rawAttrs).filter(
    ([k, v]) => v && String(v).trim() && !['fabric', 'material', 'length', 'care'].includes(k)
  );

  let related = [];
  if (p.category_id) {
    const { data } = await publicClient()
      .from('products')
      .select('*, product_images(url,sort_order)')
      .eq('is_published', true)
      .eq('category_id', p.category_id)
      .neq('id', p.id)
      .limit(8);
    related = filterVisibleProducts(data || []).slice(0, 4);
  }

  const ldImages = images.length
    ? images.map((i) => i.url)
    : [`${siteUrl()}/brand/logo-on-burgundy.png`];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    description: p.description || `${p.name} from KAYATHI LABEL`,
    image: ldImages,
    brand: { '@type': 'Brand', name: 'KAYATHI LABEL' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Number(p.price),
      availability: soldOut
        ? 'https://schema.org/OutOfStock'
        : fewLeft
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/InStock',
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
              {isNew30d && <span className="bg-gold px-2.5 py-1 text-burgundy">New arrival</span>}
              {p.is_featured && <span className="border border-burgundy px-2.5 py-1 text-burgundy">Featured</span>}
              {p.is_best_seller && <span className="border border-gold-deep bg-ivory-deep px-2.5 py-1 text-espresso">Best seller</span>}
            </div>
            <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{p.name}</h1>
            <p className="mt-2 text-sm text-espresso/60">Product ID: {p.sku}</p>

            <p className="mt-5 text-3xl text-burgundy">
              {inr(p.price)}
              {discounted && (
                <>
                  <span className="ml-3 text-lg text-espresso/50 line-through">{inr(p.original_price)}</span>
                  <span className="ml-3 text-base text-burgundy">{p.discount_percent}% off</span>
                </>
              )}
            </p>

            <div className="mt-3">
              {soldOut ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy/10 px-3 py-1 text-xs font-medium text-burgundy">
                  <span className="h-2 w-2 rounded-full bg-burgundy" /> Sold out
                </span>
              ) : fewLeft ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                  <span className="h-2 w-2 rounded-full bg-amber-600" /> Few left — only {p.stock} in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-700" /> In stock
                </span>
              )}
            </div>

            {p.description && <p className="mt-6 max-w-xl whitespace-pre-line leading-relaxed">{p.description}</p>}

            <OrderPanel
              product={{ name: p.name, sku: p.sku, slug: p.slug, image: images[0]?.url || null, price: p.price, sizes: p.sizes, colours: p.colours, stock: p.stock, is_available: p.is_available }}
              whatsapp={settings.whatsapp}
            />

            <dl className="mt-10 border-t border-espresso/15">
              {fabricOrMaterial && (
                <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-espresso/10 py-3 text-sm">
                  <dt className="text-espresso/65">Fabric / Material</dt>
                  <dd>{fabricOrMaterial}</dd>
                </div>
              )}
              {sizeOrLength && (
                <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-espresso/10 py-3 text-sm">
                  <dt className="text-espresso/65">Size / Length</dt>
                  <dd>{sizeOrLength}</dd>
                </div>
              )}
              {colourList && (
                <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-espresso/10 py-3 text-sm">
                  <dt className="text-espresso/65">Colour</dt>
                  <dd>{colourList}</dd>
                </div>
              )}
              {extraAttrs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-espresso/10 py-3 text-sm">
                  <dt className="text-espresso/65">{ALL_ATTRIBUTE_LABELS[k] || k}</dt>
                  <dd className="whitespace-pre-line">{String(v)}</dd>
                </div>
              ))}
              {careText && (
                <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-espresso/10 py-3 text-sm">
                  <dt className="text-espresso/65">Care instructions</dt>
                  <dd className="whitespace-pre-line">{careText}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
      <ProductRow title="You may also like" products={related} minItems={1} />
    </>
  );
}
