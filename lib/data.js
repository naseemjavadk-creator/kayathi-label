import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SITE_CONFIG, SHOW_SAMPLE_PRODUCTS } from '@/config/site';

export function isSampleProduct(p) {
  if (!p) return false;
  return /^sample\b/i.test(String(p.name || '').trim()) || /^SAMPLE-/i.test(String(p.sku || '').trim());
}

export function filterVisibleProducts(products = []) {
  if (SHOW_SAMPLE_PRODUCTS) return products || [];
  return (products || []).filter((p) => !isSampleProduct(p));
}

export function isProductNew(p, days = SITE_CONFIG.newBadgeDays || 30) {
  if (!p?.created_at) return Boolean(p?.is_new);
  const createdMs = Date.parse(p.created_at);
  if (Number.isNaN(createdMs)) return Boolean(p?.is_new);
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  return createdMs >= cutoffMs;
}

export function hasRealDiscount(p) {
  const price = Number(p?.price);
  const compare = Number(p?.original_price);
  return Number.isFinite(price) && Number.isFinite(compare) && compare > price;
}

const DEFAULT_SUPABASE_URL = 'https://srhhekxjnfnudzgqibwj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaGhla3hqbmZudWR6Z3FpYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDUzMzUsImV4cCI6MjEwOTM4MTMzNX0.5sZn_z1AFoBOvHv_uRZw5cZddl1t1xH7aYsY4nhFhcY';

let _publicClient;

// Read-only client for the public website. Uses the public (anon) key only.
// Row Level Security in the database limits it to published products.
export function publicClient() {
  if (!_publicClient) {
    _publicClient = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim(),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim(),
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

export const siteUrl = () => {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kayathi-label-6f9d.vercel.app')
    .replace(/[`'"]/g, '')
    .trim()
    .replace(/\/$/, '');
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProto).origin;
  } catch {
    return 'https://kayathi-label-6f9d.vercel.app';
  }
};

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

// Active categories and subcategories that have at least one visible published product.
export const getActiveTaxonomy = cachedQuery('active_taxonomy', 15000, async () => {
  try {
    const db = publicClient();
    const [{ data: cats }, { data: prods }] = await Promise.all([
      db
        .from('categories')
        .select('id,name,slug,sort_order,subcategories(id,name,slug,sort_order)')
        .order('sort_order'),
      db
        .from('products')
        .select('id,name,sku,category_id,subcategory_id,price,is_new,created_at,is_available,stock')
        .eq('is_published', true)
        .limit(1000),
    ]);
    const visible = filterVisibleProducts(prods || []);
    const activeCategoryIds = new Set(visible.map((p) => p.category_id).filter(Boolean));
    const activeSubcategoryIds = new Set(visible.map((p) => p.subcategory_id).filter(Boolean));
    const activeCategories = (cats || [])
      .filter((c) => activeCategoryIds.has(c.id))
      .map((c) => ({
        ...c,
        subcategories: (c.subcategories || []).filter((s) => activeSubcategoryIds.has(s.id)),
      }));
    const activeCategorySlugs = activeCategories.map((c) => c.slug);
    const hasGiftsUnder2500 = visible.some((p) => Number(p.price) <= 2500);
    return {
      activeCategories,
      activeCategorySlugs,
      hasGiftsUnder2500,
      hasAnyProducts: visible.length > 0,
    };
  } catch {
    return {
      activeCategories: [],
      activeCategorySlugs: [],
      hasGiftsUnder2500: false,
      hasAnyProducts: false,
    };
  }
});

function categorySlugFromHref(href) {
  if (!href || !href.startsWith('/category/')) return null;
  return href.replace('/category/', '').split('?')[0];
}

export function filterNavigation(navItems = [], taxonomy = {}) {
  const slugSet = new Set(taxonomy.activeCategorySlugs || []);
  const hasGifts = Boolean(taxonomy.hasGiftsUnder2500);
  const jewelleryActive =
    slugSet.has('jewellery') || slugSet.has('bangles-bracelets') || slugSet.has('rings');

  return (navItems || []).reduce((acc, item) => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      const catSlug = categorySlugFromHref(item.href);
      if (catSlug === 'jewellery' && !jewelleryActive) return acc;

      const filteredChildren = item.children.filter((child) => {
        const childSlug = categorySlugFromHref(child.href);
        if (!childSlug) return true;
        if (childSlug === 'jewellery') return jewelleryActive;
        return slugSet.has(childSlug);
      });

      const subOnly = filteredChildren.filter((c) => c.href !== item.href);
      if (subOnly.length === 0) {
        acc.push({ ...item, children: undefined });
      } else {
        acc.push({ ...item, children: filteredChildren });
      }
      return acc;
    }

    const catSlug = categorySlugFromHref(item.href);
    if (catSlug) {
      if (catSlug === 'jewellery' ? !jewelleryActive : !slugSet.has(catSlug)) {
        return acc;
      }
    }
    if (item.href === '/shop?max=2500' && !hasGifts) {
      return acc;
    }
    acc.push(item);
    return acc;
  }, []);
}

export function filterFooterShopLinks(shopLinks = [], taxonomy = {}) {
  const slugSet = new Set(taxonomy.activeCategorySlugs || []);
  const hasGifts = Boolean(taxonomy.hasGiftsUnder2500);
  const jewelleryActive =
    slugSet.has('jewellery') || slugSet.has('bangles-bracelets') || slugSet.has('rings');

  return (shopLinks || []).filter((item) => {
    const catSlug = categorySlugFromHref(item.href);
    if (catSlug) {
      if (catSlug === 'jewellery') return jewelleryActive;
      return slugSet.has(catSlug);
    }
    if (item.href === '/shop?max=2500') return hasGifts;
    return true;
  });
}
