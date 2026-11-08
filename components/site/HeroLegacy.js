import Link from 'next/link';
import Image from 'next/image';
import Twinkles from './Twinkles';
import BannerSlider from './BannerSlider';
import { SITE_CONFIG } from '@/config/site';

/**
 * Backup of the previous homepage hero section.
 * Set `HERO_CONFIG.useLegacyHero = true` in `/config/hero.js` to switch back to this hero immediately.
 */
export default function HeroLegacy({ banners = [] }) {
  if (banners.length > 0) {
    return <BannerSlider banners={banners} />;
  }
  return (
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
              sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw"
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
  );
}
