// @ts-check

/**
 * Runway Lookbook settings.
 *
 * The lookbook is split by category: one runway for each subcategory that has products
 * (Rings, Chains, Bracelets, Earrings, Silk Sarees, Cotton Sarees…). New categories appear
 * automatically when you add products to them.
 *
 * Each category is one sheet. Inside a sheet, customers swipe through every product in it.
 * In the owner dashboard (/admin/lookbook) you can set each sheet's photo (shown on its
 * button), change the order of the sheets, or hide one.
 */
export const LOOKBOOK_CONFIG = {
  /** Show the lookbook on the homepage (the /lookbook page always works). */
  showOnHome: true,
  title: 'The Runway Edit',
  intro: 'Choose a category, then swipe to see every piece in it.',
  lookLabel: 'Look',
  shopText: 'View this piece',
  firstLookNumber: 1,
};
