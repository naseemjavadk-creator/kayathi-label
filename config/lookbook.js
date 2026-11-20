// @ts-check

/**
 * Runway Lookbook settings.
 *
 * EASIEST: manage looks in the owner dashboard at /admin/lookbook (needs the SQL file
 * supabase/migrations/20261120_lookbook.sql run once in Supabase). Looks saved there win
 * over everything below.
 *
 * HOW TO ADD LOOKS IN CODE INSTEAD
 * 1. Put full-length model photos in /public/lookbook (transparent PNG cut-outs look best,
 *    portrait 2:3). Supabase storage URLs from the admin uploader also work.
 * 2. Add an entry to `looks` below with the photo and the product slugs worn in it.
 *    The slug is the last part of a product URL: /product/<slug>.
 *
 * While the dashboard and `looks` are both empty, the lookbook builds itself from your published products:
 * each look uses a saree photo plus matching jewellery, so it is never blank.
 *
 * @typedef {Object} LookConfig
 * @property {string} [image]      Model photo. Defaults to the first product's main photo.
 * @property {string} [alt]        Alt text for the model photo.
 * @property {string[]} products   Product slugs shown in "Shop the look" (first one is the "Shop the look" link).
 */

export const LOOKBOOK_CONFIG = {
  /** Show the lookbook on the homepage (the /lookbook page always works). */
  showOnHome: true,
  title: 'The Runway Edit',
  intro:
    'Handwoven drapes and heirloom silks, seen the way they were made to move. Drag, swipe or use the arrows to walk the collection.',
  lookLabel: 'Look',
  shopText: 'Shop the look',
  firstLookNumber: 1,
  /** Max products listed for each look (1–3). */
  productsPerLook: 3,
  /** Number of looks to build automatically when `looks` is empty (max 10). */
  autoLookCount: 6,
  /** Category slug whose products lead each automatic look. */
  autoLeadCategory: 'sarees',

  /** @type {LookConfig[]} */
  looks: [
    // { image: '/lookbook/look-1.png', alt: 'Kanjivaram silk saree with kemp jhumkas', products: ['kanjivaram-silk-saree', 'gold-kemp-jhumkas'] },
  ],
};
