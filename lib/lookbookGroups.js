// Lookbook category helpers shared by the website and the owner dashboard.

/**
 * The lookbook group a product belongs to: its subcategory (Rings, Chains, Silk Sarees…),
 * or its category when it has no subcategory. Shared with the owner dashboard.
 */
export function lookbookGroupKey(p) {
  if (!p) return null;
  if (p.subcategory_id) return `sub:${p.subcategory_id}`;
  if (p.category_id) return `cat:${p.category_id}`;
  return null;
}

/** Ordered list of every possible group from the category tree. */
export function lookbookGroupsFromTaxonomy(cats = []) {
  const out = [];
  [...cats]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .forEach((c) => {
      [...(c.subcategories || [])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .forEach((s) =>
          out.push({ key: `sub:${s.id}`, name: s.name, parent: c.name, href: `/category/${c.slug}?sub=${s.slug}` })
        );
      out.push({ key: `cat:${c.id}`, name: c.name, parent: '', href: `/category/${c.slug}` });
    });
  return out;
}
