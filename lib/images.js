export const sortedImages = (p) =>
  [...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order);
