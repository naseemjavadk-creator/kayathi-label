import Link from 'next/link';
import Image from 'next/image';
import { publicClient, getSettings, getComingSoon, sortedImages } from '@/lib/data';
import { loadPlayProducts } from '@/lib/playData';
import { ComingSoonRow } from '@/components/site/ComingSoon';
import BannerSlider from '@/components/site/BannerSlider';
import ProductRow from '@/components/site/ProductRow';
import Photo from '@/components/site/Photo';
import { InstagramIcon } from '@/components/Icons';
import Reveal from '@/components/site/Reveal';
import Twinkles from '@/components/site/Twinkles';
import PlayTeaser from '@/components/site/PlayTeaser';

export const dynamic = 'force-dynamic';
const SEL = '*, product_images(url,sort_order)';

export default async function Home() {
  const db = publicClient();
  const [settings, soon] = await Promise.all([getSettings(), getComingSoon()]);
  const pub = () => db.from('products').select(SEL).eq('is_published', true);

  const [cats, banners, fresh, featured, best, offers, covers, insta, playProducts] = await Promise.all([
    db.from('categories').select('id,name,slug,subcategories(id,name,slug,sort_order)').order('sort_order'),
    db.from('banners').select('*').eq('is_active', true).order('sort_order'),
    pub().eq('is_new', true).order('created_at', { ascending: false }).limit(8),
    pub().eq('is_featured', true).order('created_at', { ascending: false }).limit(8),
    pub().eq('is_best_seller', true).order('created_at', { ascending: false }).limit(8),
    pub().gt('discount_percent', 0).order('discount_percent', { ascending: false }).limit(8),
    db.from('products').select('category_id, subcategory_id, is_available, stock, product_images(url,sort_order)').eq('is_published', true).limit(1000),
    db.from('instagram_posts').select('*').order('sort_order').limit(6),
    loadPlayProducts(),
  ]);

  // Only show collections and types that have something in stock.
  const inStock = (covers.data || []).filter((p) => p.is_available && p.stock > 0);
  const catsWithStock = new Set(inStock.map((p) => p.category_id));
  const subsWithStock = new Set(inStock.map((p) => p.subcategory_id));
  const categories = (cats.data || []).filter((c) => catsWithStock.has(c.id));
  const bannerList = banners.data || [];
  const heroProduct = (featured.data || []).find((p) => sortedImages(p).length) || (fresh.data || []).find((p) => sortedImages(p).length);
  const heroImage = heroProduct ? sortedImages(heroProduct)[0].url : null;
  const coverFor = (id) => {
    const p = inStock.find((x) => x.category_id === id && (x.product_images || []).length);
    return p ? sortedImages(p)[0].url : null;
  };

  return (
    <>
      {bannerList.length > 0 ? (
        <BannerSlider banners={bannerList} />
      ) : (
        <section className="bg-burgundy text-ivory">
          <div className="grid items-center md:grid-cols-2">
            <div className="relative flex flex-col justify-center overflow-hidden px-6 py-12 md:px-14 md:py-14 lg:px-20">
              <Twinkles />
              <h1 className="relative z-10 max-w-lg !text-ivory text-5xl leading-[1.05] md:text-7xl">The art of ethnic elegance</h1>
              <p className="relative z-10 mt-6 max-w-md text-ivory/85 md:text-lg">
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
      <ProductRow title="New arrivals" href="/new-arrivals" products={fresh.data} />
      <ProductRow title="Featured pieces" href="/shop" products={featured.data} />
      <ProductRow title="Best sellers" href="/shop" products={best.data} />
      <ProductRow title="Special offers" href="/shop?sort=price_asc" products={offers.data} />
      <PlayTeaser products={playProducts} whatsapp={settings.whatsapp} />

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
        {(insta.data || []).length > 0 && (
          <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {insta.data.map((p) => (
              <li key={p.id}>
                <a href={p.link_url || settings.instagram_url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden" aria-label="View on Instagram">
                  <Image src={p.image_url} alt="" fill sizes="(min-width:768px) 16vw, 33vw" className="object-cover" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </>
  );
}
