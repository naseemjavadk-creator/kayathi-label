import Link from 'next/link';
import Photo from './Photo';
import Reveal from './Reveal';
import { OCCASION_TILES } from '@/config/collections';

/**
 * Shop by Occasion tiles (Wedding, Festive, Daily Wear, Gifting)
 * Controlled from `/config/collections.js` and linked to existing shop/category routes.
 */
export default function OccasionTiles({ activeSlugs = null, hasGiftsUnder2500 = true }) {
  const slugSet = activeSlugs ? new Set(activeSlugs) : null;
  const jewelleryActive = slugSet
    ? slugSet.has('jewellery') || slugSet.has('bangles-bracelets') || slugSet.has('rings')
    : true;

  const visibleTiles = (OCCASION_TILES || []).filter((tile) => {
    if (!slugSet) return true;
    if (tile.href === '/shop?max=2500') return hasGiftsUnder2500;
    if (tile.href?.startsWith('/category/')) {
      const slug = tile.href.replace('/category/', '').split('?')[0];
      if (slug === 'jewellery') return jewelleryActive;
      return slugSet.has(slug);
    }
    return true;
  });

  if (visibleTiles.length === 0) return null;

  return (
    <Reveal as="section" className="container-x py-12 md:py-16">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
            DRESS FOR THE MOMENT
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl">Shop by Occasion</h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-medium text-burgundy underline-offset-4 hover:underline"
        >
          Browse all pieces →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {visibleTiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="group relative flex flex-col overflow-hidden border border-gold/30 bg-burgundy text-ivory shadow-sm"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Photo
                src={tile.imageUrl}
                alt={tile.title}
                sizes="(min-width: 768px) 25vw, 50vw"
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/20 to-transparent" />
              {tile.badge && (
                <span className="absolute left-3 top-3 border border-gold/40 bg-burgundy-dark/90 px-2.5 py-1 text-[11px] uppercase tracking-wider text-gold">
                  {tile.badge}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-serif text-xl leading-snug !text-ivory group-hover:!text-gold md:text-2xl">
                  {tile.title}
                </h3>
                {tile.subtitle && (
                  <p className="mt-1 text-xs leading-relaxed text-ivory/85">
                    {tile.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
