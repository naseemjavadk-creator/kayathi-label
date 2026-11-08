import Link from 'next/link';
import Photo from './Photo';
import Reveal from './Reveal';
import { THEMED_COLLECTIONS } from '@/config/collections';
import { SITE_CONFIG } from '@/config/site';
import { sortedImages } from '@/lib/images';
import { inr } from '@/lib/format';

const MIN_ITEMS = SITE_CONFIG.minSectionProducts || 3;

/**
 * Renders 2–3 themed collection blocks (banner, title, 1-line story, 3 product thumbnails, "View collection" button).
 * Automatically hides any collection block that has fewer than 3 visible products, and hides the entire section if none qualify.
 */
export default function ThemedCollections({ products = [], categories = [] }) {
  if (!products || products.length < MIN_ITEMS) return null;

  const slugByCatId = new Map((categories || []).map((c) => [c.id, c.slug]));

  const usedIds = new Set();
  const activeBlocks = (THEMED_COLLECTIONS || [])
    .filter((col) => col && col.active)
    .map((col) => {
      const targetSlugs = new Set(col.categorySlugs || []);
      const matches = products.filter((p) => {
        if (!p || usedIds.has(p.id)) return false;
        const catSlug = slugByCatId.get(p.category_id);
        return catSlug && targetSlugs.has(catSlug);
      });
      if (matches.length < MIN_ITEMS) return null;
      const picks = matches.slice(0, 3);
      picks.forEach((p) => usedIds.add(p.id));
      const fallbackBanner = sortedImages(picks[0])[0]?.url || '';
      return {
        ...col,
        bannerUrl: col.bannerImage || fallbackBanner,
        picks,
      };
    })
    .filter(Boolean);

  if (activeBlocks.length === 0) return null;

  return (
    <Reveal as="section" className="container-x py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
            CURATED STORIES
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl">Featured Collections</h2>
        </div>
      </div>

      <div className="space-y-12">
        {activeBlocks.map((block, idx) => (
          <div
            key={block.id}
            className="grid items-center gap-8 border border-gold/30 bg-ivory-deep/70 p-6 md:grid-cols-12 md:p-8"
          >
            {/* Collection Banner (1500x1000 / 3:2 aspect) */}
            <div className={`md:col-span-5 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
              <Link href={block.ctaHref} className="group block overflow-hidden border border-gold/25 bg-burgundy">
                <div className="relative aspect-[3/2] w-full overflow-hidden">
                  <Photo
                    src={block.bannerUrl}
                    alt={block.title}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            </div>

            {/* Story + 3 Product Thumbnails + CTA */}
            <div className={`md:col-span-7 ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
              {block.eyebrow && (
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
                  {block.eyebrow}
                </p>
              )}
              <h3 className="mt-1 font-serif text-3xl text-burgundy md:text-4xl">
                {block.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-espresso/80 md:text-base">
                {block.story}
              </p>

              {/* 3 Product Thumbnails */}
              <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                {block.picks.map((p) => {
                  const thumb = sortedImages(p)[0]?.url;
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      className="group block border border-espresso/10 bg-ivory p-2 transition hover:border-gold"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gold/15">
                        <Photo
                          src={thumb}
                          alt={p.name}
                          sizes="(min-width: 768px) 15vw, 30vw"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 truncate font-serif text-sm text-espresso group-hover:text-burgundy">
                        {p.name}
                      </p>
                      <p className="text-xs font-medium text-burgundy">{inr(p.price)}</p>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6">
                <Link href={block.ctaHref} className="btn btn-primary">
                  {block.ctaLabel || 'View collection'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
