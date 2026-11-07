import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

let _publicClient;

// Read-only client for the public website. Uses the public (anon) key only.
// Row Level Security in the database limits it to published products.
export function publicClient() {
  if (!_publicClient) {
    _publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
        global: { fetch: (url, opts) => fetch(url, { ...opts, next: { revalidate: 15 } }) },
      }
    );
  }
  return _publicClient;
}

// Short-lived in-memory cache so navigating across pages doesn't re-query static/shared tables on every click.
const memCache = new Map();
function cachedQuery(key, ttlMs, fn) {
  return cache(async () => {
    const now = Date.now();
    const hit = memCache.get(key);
    if (hit && hit.expiresAt > now) return hit.value;
    if (hit?.promise) return hit.promise;
    const promise = fn()
      .then((val) => {
        memCache.set(key, { value: val, expiresAt: Date.now() + ttlMs });
        return val;
      })
      .catch((err) => {
        memCache.delete(key);
        throw err;
      });
    memCache.set(key, { promise, expiresAt: now + ttlMs });
    return promise;
  });
}

export const DEFAULT_SETTINGS = {
  whatsapp: '+917907139297',
  email: 'kayathilabel@gmail.com',
  phone: '+917907139297',
  address: '',
  maps_url: '',
  instagram_url: 'https://www.instagram.com/kayathilabel/',
  instagram_handle: '@kayathilabel',
  opening_hours: '',
  home_intro:
    'KAYATHI LABEL is a premium Indian ethnic fashion and accessories boutique. Explore sarees, jewellery, bangles, rings and accessories, and order directly on WhatsApp.',
  about_story: '',
  about_vision: '',
  about_style: '',
  about_collections: '',
  about_commitment: '',
  logo_url: '',
  logo_light_url: '',
  low_stock_threshold: 3,
};

export const getSettings = cachedQuery('settings', 15000, async () => {
  try {
    const { data } = await publicClient().from('site_settings').select('*').eq('id', 1).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...(data || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export { sortedImages } from './images';

// Items the owner has marked "coming soon" (shown as a running ticker and a homepage strip).
export const getComingSoon = cachedQuery('coming_soon', 15000, async () => {
  try {
    const { data } = await publicClient().from('coming_soon').select('*').eq('is_active', true).order('sort_order');
    return data || [];
  } catch {
    return [];
  }
});

// Categories and subcategories for navigation and filtering.
export const getCategories = cachedQuery('categories', 15000, async () => {
  try {
    const { data } = await publicClient()
      .from('categories')
      .select('id,name,slug,subcategories(id,name,slug,sort_order)')
      .order('sort_order');
    return data || [];
  } catch {
    return [];
  }
});
