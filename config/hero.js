// @ts-check

/**
 * @typedef {Object} HeroSlide
 * @property {string} id
 * @property {boolean} active
 * @property {string} [startDate] - Optional ISO date string (YYYY-MM-DD) when slide becomes active
 * @property {string} [endDate] - Optional ISO date string (YYYY-MM-DD) when slide expires
 * @property {string} [desktopImage] - 1920x800 desktop banner image path in /public (leave empty for branded burgundy/gold placeholder)
 * @property {string} [mobileImage] - 900x1200 mobile banner image path in /public (leave empty to use desktopImage or branded placeholder)
 * @property {string} [imageAlt]
 * @property {string} eyebrow - Small uppercase label above heading
 * @property {string} heading - Main slide headline
 * @property {string} subheading - One-line description
 * @property {string} ctaLabel - Primary button text
 * @property {string} ctaHref - Primary button destination route
 * @property {string} [secondaryCtaLabel] - Optional secondary button text
 * @property {string} [secondaryCtaHref] - Optional secondary button destination route
 */

export const HERO_CONFIG = {
  /** Switch to true if you ever want to revert to the legacy static 2-column hero */
  useLegacyHero: false,
  /** Auto-advance interval in milliseconds (5000 = 5 seconds) */
  autoPlayIntervalMs: 5000,
  /** Subtle zoom animation on the active slide (automatically disabled when prefers-reduced-motion is set) */
  enableSubtleZoom: true,
};

/** @type {HeroSlide[]} */
export const HERO_SLIDES = [
  {
    id: 'slide-signature-sarees',
    active: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    desktopImage: '/brand/hero-banner.jpg',
    mobileImage: '/brand/hero-banner.jpg',
    imageAlt: 'KAYATHI LABEL — Handpicked Silk Sarees & Traditional Ornaments',
    eyebrow: 'THE ART OF ETHNIC ELEGANCE',
    heading: 'Timeless Sarees & Heritage Ornaments',
    subheading: 'Handpicked festive weaves and antique-finish jewellery—order directly on WhatsApp with pan-India delivery.',
    ctaLabel: 'Explore Sarees',
    ctaHref: '/category/sarees',
    secondaryCtaLabel: 'Shop All',
    secondaryCtaHref: '/shop',
  },
  {
    id: 'slide-jewellery-bangles',
    active: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    desktopImage: '',
    mobileImage: '',
    imageAlt: 'KAYATHI LABEL — Temple & Antique Finish Jewellery Collection',
    eyebrow: 'CURATED ADORNMENTS',
    heading: 'Statement Jewellery & Artisanal Bangles',
    subheading: 'From temple-inspired jhumkas to glass and gold-toned bangle sets crafted for weddings and celebrations.',
    ctaLabel: 'Shop Jewellery',
    ctaHref: '/category/jewellery',
    secondaryCtaLabel: 'Shop Bangles',
    secondaryCtaHref: '/category/bangles-bracelets',
  },
  {
    id: 'slide-new-arrivals-gifting',
    active: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    desktopImage: '',
    mobileImage: '',
    imageAlt: 'KAYATHI LABEL — New Arrivals & Thoughtful Ethnic Gifting',
    eyebrow: 'JUST ARRIVED AT KAYATHI LABEL',
    heading: 'Fresh Drops & Thoughtful Ethnic Gifts',
    subheading: 'Discover our newest small-batch pieces and celebration-ready gifts packed with care.',
    ctaLabel: 'View New Arrivals',
    ctaHref: '/new-arrivals',
    secondaryCtaLabel: 'Find a Gift',
    secondaryCtaHref: '/shop?max=2500',
  },
];

/**
 * Filters slides by `active` flag and optional `startDate` / `endDate` window.
 * @param {HeroSlide[]} [slides]
 * @param {Date} [now]
 * @returns {HeroSlide[]}
 */
export function getActiveHeroSlides(slides = HERO_SLIDES, now = new Date()) {
  const nowMs = now.getTime();
  return (slides || []).filter((slide) => {
    if (!slide || !slide.active) return false;
    if (slide.startDate) {
      const startMs = Date.parse(slide.startDate);
      if (!Number.isNaN(startMs) && nowMs < startMs) return false;
    }
    if (slide.endDate) {
      const endMs = Date.parse(`${slide.endDate}T23:59:59`);
      if (!Number.isNaN(endMs) && nowMs > endMs) return false;
    }
    return true;
  });
}
