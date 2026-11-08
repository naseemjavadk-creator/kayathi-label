// @ts-check

/**
 * @typedef {Object} CategoryTileConfig
 * @property {string} id
 * @property {string} slug - Matches Supabase category slug where applicable
 * @property {string} title
 * @property {string} subtitle
 * @property {string} href
 * @property {string} [imageUrl] - Optional 600x600 static image path in /public
 */

/**
 * @typedef {Object} ThemedCollectionConfig
 * @property {string} id
 * @property {boolean} active
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} story - One-line editorial story
 * @property {string} [bannerImage] - 1500x1000 banner image path in /public (uses branded fallback if empty)
 * @property {string} ctaLabel
 * @property {string} ctaHref
 * @property {string[]} categorySlugs - Category slugs used to match 3 product thumbnails from live data
 */

/**
 * @typedef {Object} PromoBannerConfig
 * @property {boolean} enabled
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} text
 * @property {string} primaryLabel
 * @property {string} primaryHref
 * @property {string} [secondaryLabel]
 * @property {string} [secondaryHref]
 */

/**
 * @typedef {Object} OccasionTileConfig
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} href
 * @property {string} [imageUrl] - Optional 600x600 tile image in /public
 * @property {string} badge
 */

/** @type {CategoryTileConfig[]} */
export const CATEGORY_TILES = [
  {
    id: 'cat-sarees',
    slug: 'sarees',
    title: 'Sarees',
    subtitle: 'Silk, festive & handpicked drapes',
    href: '/category/sarees',
    imageUrl: '/brand/hero-banner.jpg',
  },
  {
    id: 'cat-jewellery',
    slug: 'jewellery',
    title: 'Jewellery',
    subtitle: 'Necklaces, jhumkas & sets',
    href: '/category/jewellery',
    imageUrl: '',
  },
  {
    id: 'cat-bangles',
    slug: 'bangles-bracelets',
    title: 'Bangles',
    subtitle: 'Traditional & stackable sets',
    href: '/category/bangles-bracelets',
    imageUrl: '',
  },
  {
    id: 'cat-rings',
    slug: 'rings',
    title: 'Rings',
    subtitle: 'Statement & adjustable rings',
    href: '/category/rings',
    imageUrl: '',
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    title: 'Accessories',
    subtitle: 'Hair ornaments, bindis & more',
    href: '/category/accessories',
    imageUrl: '',
  },
  {
    id: 'cat-gifts',
    slug: 'gifts',
    title: 'Gifts',
    subtitle: 'Thoughtful picks under ₹2,500',
    href: '/shop?max=2500',
    imageUrl: '',
  },
];

/** @type {ThemedCollectionConfig[]} */
export const THEMED_COLLECTIONS = [
  {
    id: 'collection-royal-weaves',
    active: true,
    eyebrow: 'SIGNATURE EDIT',
    title: 'The Festive Silk Edit',
    story: 'Rich zari borders and luminous drapes chosen for weddings, pujas, and family celebrations.',
    bannerImage: '/brand/hero-banner.jpg',
    ctaLabel: 'View collection',
    ctaHref: '/category/sarees',
    categorySlugs: ['sarees'],
  },
  {
    id: 'collection-heritage-adornments',
    active: true,
    eyebrow: 'HEIRLOOM FINISH',
    title: 'Temple & Antique Adornments',
    story: 'Intricate necklaces, statement jhumkas, and artisanal bangles that complete every traditional look.',
    bannerImage: '',
    ctaLabel: 'View collection',
    ctaHref: '/category/jewellery',
    categorySlugs: ['jewellery', 'bangles-bracelets', 'rings'],
  },
  {
    id: 'collection-finishing-touches',
    active: true,
    eyebrow: 'CURATED DETAILS',
    title: 'Celebration Finishing Touches',
    story: 'Delicate rings, hair accessories, and gift-ready treasures crafted to elevate everyday and festive attire.',
    bannerImage: '',
    ctaLabel: 'View collection',
    ctaHref: '/category/accessories',
    categorySlugs: ['accessories', 'rings', 'bangles-bracelets'],
  },
];

/** @type {PromoBannerConfig} */
export const PROMO_BANNER = {
  enabled: true,
  startDate: '2026-01-01',
  endDate: '2028-12-31',
  eyebrow: 'PERSONAL WHATSAPP STYLING',
  heading: 'Need Help Matching Jewellery With Your Saree?',
  text: 'Message our boutique team on WhatsApp for close-up videos, drape checks, and personalised bangle or necklace pairings before you order.',
  primaryLabel: 'Chat on WhatsApp',
  primaryHref: 'whatsapp',
  secondaryLabel: 'Browse All Collections',
  secondaryHref: '/shop',
};

/** @type {OccasionTileConfig[]} */
export const OCCASION_TILES = [
  {
    id: 'occasion-wedding',
    title: 'Wedding & Bridal',
    subtitle: 'Heirloom sarees & statement temple sets',
    href: '/category/sarees',
    imageUrl: '/brand/hero-banner.jpg',
    badge: 'Bridal Edit',
  },
  {
    id: 'occasion-festive',
    title: 'Festive Celebrations',
    subtitle: 'Luminous weaves, jhumkas & bangle stacks',
    href: '/category/jewellery',
    imageUrl: '',
    badge: 'Festive Picks',
  },
  {
    id: 'occasion-daily',
    title: 'Effortless Daily Wear',
    subtitle: 'Lightweight drapes, rings & everyday accents',
    href: '/category/accessories',
    imageUrl: '',
    badge: 'Everyday Grace',
  },
  {
    id: 'occasion-gifting',
    title: 'Thoughtful Gifting',
    subtitle: 'Curated ethnic treasures under ₹2,500',
    href: '/shop?max=2500',
    imageUrl: '',
    badge: 'Under ₹2,500',
  },
];
