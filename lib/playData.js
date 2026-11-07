import { publicClient } from './data';

// Published products with what the games need. Read-only, public key.
export async function loadPlayProducts() {
  const { data } = await publicClient()
    .from('products')
    .select(
      'id,sku,name,slug,price,original_price,discount_percent,stock,is_available,is_new,is_featured,is_best_seller,colours,categories(slug),subcategories(name),product_images(url,sort_order)'
    )
    .eq('is_published', true)
    .limit(300);
  return data || [];
}

export const soldOut = (p) => !p.is_available || p.stock <= 0;
