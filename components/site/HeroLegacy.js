import Link from 'next/link';
import Image from 'next/image';
import BannerSlider from './BannerSlider';

export default function HeroLegacy({ banners = [] }) {
  if (banners.length > 0) {
    return <BannerSlider banners={banners} />;
  }
  return (
    <section className="relative w-full bg-burgundy text-ivory">
      <h1 className="sr-only">
        KAYATHI LABELS — Timeless Beauty, Forever Yours. Premium Sarees, Exquisite Jewellery &amp; More.
      </h1>
      <Link
        href="/shop"
        aria-label="Explore Collection — Shop Sarees, Jewellery & More"
        className="group relative block w-full cursor-pointer overflow-hidden bg-burgundy"
      >
        <Image
          src="/brand/timeless-beauty-hero.png"
          alt="KAYATHI LABELS — Timeless Beauty, Forever Yours. Premium Sarees, Exquisite Jewellery & More"
          width={1024}
          height={429}
          priority
          quality={100}
          unoptimized
          sizes="100vw"
          className="block h-auto w-full object-contain [image-rendering:high-quality]"
        />
        {/* Interactive hover ring on the "Explore Collection ->" button */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[15.2%] top-[67.1%] h-[8.4%] w-[15.1%] rounded-md transition duration-200 group-hover:bg-ivory/15 group-hover:ring-2 group-hover:ring-gold group-active:scale-95"
        />
      </Link>
    </section>
  );
}
