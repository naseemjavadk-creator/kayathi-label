// @ts-check

/**
 * Runway Lookbook settings.
 *
 * The lookbook is split by category: one runway for each subcategory that has products
 * (Rings, Chains, Bracelets, Earrings, Silk Sarees, Cotton Sarees…). New categories appear
 * automatically when you add products to them.
 *
 * Each category is one slide on the runway, and its side list shows every product in it.
 * In the owner dashboard (/admin/lookbook) you can set each slide's model photo, change
 * the order of the slides, or hide one. Without a photo, the first product's photo is used.
 */
export const LOOKBOOK_CONFIG = {
  /** Show the lookbook on the homepage (the /lookbook page always works). */
  showOnHome: true,
  title: 'The Runway Edit',
  intro: 'Drag, swipe or use the arrows to walk the collection.',
  lookLabel: 'Look',
  shopText: 'Shop all',
  firstLookNumber: 1,
};
