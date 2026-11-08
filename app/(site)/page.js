import Link from 'next/link';
import Image from 'next/image';
import {
  publicClient,
  getSettings,
  getComingSoon,
  sortedImages,
  filterVisibleProducts,
  isProductNew,
  hasRealDiscount,
  siteUrl,
} from '@/lib/data';
import { SITE_CONFIG } from '@/config/site';
import { loadPlayProducts } from '@/lib/playData';
import { ComingSoonRow } from '@/components/site/ComingSoon';
import BannerSlider from '@/components/site/BannerSlider';
import ProductRow from '@/components/site/ProductRow';
import Photo from '@/components/site/Photo';
import { InstagramIcon } from '@/components/Icons';
import Reveal from '@/components/site/Reveal';
import Twinkles from '@/components/site/Twinkles';
import PlayTeaser from '@/components/site/PlayTeaser';
import TrustStrip from '@/components/site/TrustStrip';
import Testimonials from '@/components/site/Testimonials';

export const dynamic = 'force-dynamic';
const SEL = '*, product_images(url,sort_order)';
const MIN_SECTION_ITEMS = SITE_CONFIG.minSectionProducts || 3;

export default async function Home() {
  const db = publicClient();
  const [settings, soon] = await Promise.all([getSettings(), getComingSoon()]);
  const pub = () => db.from('products').select(SEL).eq('is_published', true);

  const [cats, banners, fresh, featured, best, offers, covers, insta, playProducts] = await Promise.all([
    db.from('categories').select('id,name,slug,subcategories(id,name,slug,sort_order)').order('sort_order'),
    db.from('banners').select('*').eq('is_active', true).order('sort_order'),
    pub().eq('is_new', true).order('created_at', { ascending: false }).limit(24),
    pub().eq('is_featured', true).order('created_at', { ascending: false }).limit(24),
    pub().eq('is_best_seller', true).order('created_at', { ascending: false }).limit(24),
    pub().gt('discount_percent', 0).order('discount_percent', { ascending: false }).limit(24),
    db.from('products').select('id, name, sku, category_id, subcategory_id, is_available, stock, product_images(url,sort_order)').eq('is_published', true).limit(1000),
    db.from('instagram_posts').select('*').order('sort_order').limit(6),
    loadPlayProducts(),
  ]);

  const visibleCovers = filterVisibleProducts(covers.data || []);
  // Only show collections and types that have something in stock.
  const inStock = visibleCovers.filter((p) => p.is_available && p.stock > 0);
  const catsWithStock = new Set(inStock.map((p) => p.category_id));
  const subsWithStock = new Set(inStock.map((p) => p.subcategory_id));
  const categories = (cats.data || []).filter((c) => catsWithStock.has(c.id));
  const bannerList = banners.data || [];

  // Dedupe products across homepage sections so the same item does not repeat in every block.
  const seenProductIds = new Set();
  const takeSectionProducts = (rawList, predicate = () => true, max = 8) => {
    const filtered = filterVisibleProducts(rawList || []).filter(
      (p) => p && !seenProductIds.has(p.id) && predicate(p)
    );
    if (filtered.length < MIN_SECTION_ITEMS) return [];
    const chosen = filtered.slice(0, max);
    chosen.forEach((p) => seenProductIds.add(p.id));
    return chosen;
  };

  const newArrivalsList = takeSectionProducts(fresh.data, (p) => Boolean(p.is_new) && isProductNew(p));
  const featuredList = takeSectionProducts(featured.data, (p) => Boolean(p.is_featured));
  const bestSellersList = takeSectionProducts(best.data, (p) => p.is_best_seller === true);
  const specialOffersList = takeSectionProducts(offers.data, (p) => hasRealDiscount(p));

  const coverFor = (id) => {
    const p = inStock.find((x) => x.category_id === id && (x.product_images || []).length);
    return p ? sortedImages(p)[0].url : null;
  };

  const dbInstagramTiles = (insta.data || []).map((p, idx) => ({
    id: p.id || `db-ig-${idx}`,
    imageUrl: p.image_url,
    alt: `KAYATHI LABEL on Instagram (${idx + 1})`,
    caption: settings.instagram_handle,
    href: p.link_url || settings.instagram_url,
  }));
  const instagramTiles = [
    ...dbInstagramTiles,
    ...(SITE_CONFIG.instagramTiles || []).slice(dbInstagramTiles.length),
  ].slice(0, 6);

  const base = siteUrl();
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_CONFIG.brandName,
      url: base,
      logo: `${base}/brand/logo-on-burgundy.png`,
      email: settings.email || SITE_CONFIG.email,
      telephone: settings.phone || SITE_CONFIG.phone,
      sameAs: [settings.instagram_url || SITE_CONFIG.instagramUrl].filter(Boolean),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: SITE_CONFIG.brandName,
      description: settings.home_intro || SITE_CONFIG.valueProposition,
      url: base,
      image: `${base}/brand/hero-banner.jpg`,
      telephone: settings.phone || SITE_CONFIG.phone,
      email: settings.email || SITE_CONFIG.email,
      priceRange: '₹₹',
      areaServed: 'IN',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c') }}
      />
      {bannerList.length > 0 ? (
        <BannerSlider banners={bannerList} />
      ) : (
        <section className="bg-burgundy text-ivory">
          <div className="grid items-center md:grid-cols-2">
            <div className="relative flex flex-col justify-center overflow-hidden px-6 py-12 md:px-14 md:py-14 lg:px-20">
              <Twinkles />
              <h1 className="relative z-10 max-w-lg !text-ivory text-5xl leading-[1.05] md:text-7xl">
                {SITE_CONFIG.tagline}
              </h1>
              <p className="relative z-10 mt-4 max-w-md font-medium text-gold md:text-lg">
                {SITE_CONFIG.valueProposition}
              </p>
              <p className="relative z-10 mt-3 max-w-md text-ivory/85 md:text-base">
                Sarees, jewellery, bangles, rings and accessories from KAYATHI LABEL.
              </p>
              <div className="relative z-10 mt-9 flex flex-wrap gap-3">
                <Link href="/shop" className="btn btn-gold">Shop now</Link>
                <Link href="/new-arrivals" className="btn btn-outline-light">New arrivals</Link>
                <Link href="#fun-zone" className="btn btn-outline-light">Fun zone</Link>
              </div>
            </div>
            <div className="relative flex w-full items-center justify-center bg-burgundy">
              <Link href="/shop" aria-label="Shop now" className="group relative z-20 block w-full cursor-pointer">
                <Image
                  src="/brand/hero-banner.jpg"
                  alt="KAYATHI LABELS — Elegance in Every Thread"
                  width={1024}
                  height={559}
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="block h-auto w-full object-contain"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[65.8%] top-[80.3%] h-[7.8%] w-[18.1%] rounded-full transition duration-200 group-hover:bg-gold/20 group-hover:ring-2 group-hover:ring-gold group-active:scale-95"
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      <TrustStrip />

      <Reveal as="section" className="container-x py-14 text-center md:py-20">
        <p className="mx-auto max-w-3xl font-serif text-2xl leading-relaxed md:text-3xl">{settings.home_intro}</p>
        <Link href="/shop" className="btn btn-primary mt-8">Shop now</Link>
      </Reveal>

      {categories.length > 0 && (
        <Reveal as="section" className="container-x pb-6">
          <h2 className="mb-7 text-3xl md:text-4xl">Our collections</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <div key={c.id}>
                <Link href={`/category/${c.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gold/25">
                    <Photo src={coverFor(c.id)} alt={c.name} sizes="(min-width:1024px) 20vw, 50vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <h3 className="mt-3 text-xl">{c.name}</h3>
                </Link>
                <ul className="mt-1 space-y-0.5 text-sm text-espresso/70">
                  {[...(c.subcategories || [])].filter((s) => subsWithStock.has(s.id)).sort((a, b) => a.sort_order - b.sort_order).slice(0, 4).map((s) => (
                    <li key={s.slug}><Link href={`/category/${c.slug}?sub=${s.slug}`} className="hover:text-burgundy">{s.name}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <ComingSoonRow items={soon} whatsapp={settings.whatsapp} />
      <ProductRow title="New arrivals" href="/new-arrivals" products={newArrivalsList} minItems={MIN_SECTION_ITEMS} />
      <ProductRow title="Featured pieces" href="/shop" products={featuredList} minItems={MIN_SECTION_ITEMS} />
      <ProductRow title="Best sellers" href="/shop" products={bestSellersList} minItems={MIN_SECTION_ITEMS} />
      <ProductRow title="Special offers" href="/shop?sort=price_asc" products={specialOffersList} minItems={MIN_SECTION_ITEMS} />
      <PlayTeaser products={playProducts} whatsapp={settings.whatsapp} />
      <Testimonials />

      <Reveal as="section" className="mt-6 bg-ivory-deep">
        <div className="container-x grid gap-8 py-16 md:grid-cols-2 md:py-20">
          <h2 className="text-4xl md:text-5xl">About KAYATHI LABEL</h2>
          <div>
            <p className="max-w-xl text-lg leading-relaxed">{settings.about_story}</p>
            <Link href="/about" className="btn btn-outline mt-6">Read more</Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="container-x py-16 md:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl md:text-4xl">Follow {settings.instagram_handle} on Instagram</h2>
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <InstagramIcon /> Follow {settings.instagram_handle}
          </a>
        </div>
        {instagramTiles.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {instagramTiles.map((tile) => (
              <li key={tile.id}>
                <a
                  href={tile.href || settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden bg-burgundy"
                  aria-label={tile.alt || `View ${settings.instagram_handle} on Instagram`}
                >
                  <Image
                    src={tile.imageUrl}
                    alt={tile.alt || `${settings.instagram_handle} Instagram post`}
                    fill
                    sizes="(min-width: 768px) 16vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {tile.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/80 to-transparent px-2.5 py-2 text-xs text-ivory opacity-90 transition-opacity group-hover:opacity-100">
                      {tile.caption}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </>
  );
}
