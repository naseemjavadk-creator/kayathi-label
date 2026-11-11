import Link from 'next/link';
import Photo from './Photo';
import Reveal from './Reveal';
import { CATEGORY_TILES } from '@/config/collections';

/**
 * Shop-by-category tiles (Sarees, Jewellery, Bangles, Rings, Accessories, Gifts):
 * - Horizontal scroll with snap on mobile
 * - 6-column responsive grid on desktop
 * - Hover zoom and automatic branded burgundy/gold fallback via Photo component
 */
export default function CategoryTiles({ coverBySlug = {}, activeSlugs = null, hasGiftsUnder2500 = true }) {
  const slugSet = activeSlugs ? new Set(activeSlugs) : null;
  const visibleTiles = (CATEGORY_TILES || []).filter((tile) => {
    if (!slugSet) return true;
    if (tile.slug === 'gifts') return hasGiftsUnder2500;
    return slugSet.has(tile.slug);
  });

  if (visibleTiles.length === 0) return null;

  return (
    <Reveal as="section" className="container-x py-12 md:py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
            CURATED DEPARTMENTS
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl">Shop by Category</h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-medium text-burgundy underline-offset-4 hover:underline"
        >
          View full catalogue →
        </Link>
      </div>

      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-3 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6">
        {visibleTiles.map((tile) => {
          const resolvedImage = coverBySlug[tile.slug] || tile.imageUrl || '';
          return (
            <Link
              key={tile.id}
              href={tile.href}
              className="group relative w-44 shrink-0 snap-start md:w-auto"
            >
              <div className="relative aspect-square overflow-hidden border border-gold/30 bg-burgundy shadow-sm">
                <Photo
                  src={resolvedImage}
                  alt={tile.title}
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 176px"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-ivory">
                  <h3 className="font-serif text-xl leading-tight !text-ivory group-hover:!text-gold">
                    {tile.title}
                  </h3>
                  {tile.subtitle && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-ivory/85">
                      {tile.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
