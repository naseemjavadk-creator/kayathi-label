'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Photo from './Photo';
import { CloseIcon, HeartIcon, WhatsAppIcon } from '@/components/Icons';
import { inr } from '@/lib/format';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const STORAGE_KEY = 'kayathi_wishlist_v1';

const WishlistContext = createContext({
  items: [],
  open: false,
  setOpen: () => {},
  isSaved: () => false,
  toggleItem: () => {},
  removeItem: () => {},
});

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items, hydrated]);

  function isSaved(idOrSlug) {
    if (!idOrSlug) return false;
    return items.some((it) => it.id === idOrSlug || it.slug === idOrSlug);
  }

  function toggleItem(product) {
    if (!product) return;
    const key = product.id || product.slug;
    if (!key) return;
    setItems((prev) => {
      const exists = prev.some((it) => (it.id || it.slug) === key);
      if (exists) {
        return prev.filter((it) => (it.id || it.slug) !== key);
      }
      return [
        {
          id: product.id || product.slug,
          slug: product.slug,
          sku: product.sku || '',
          name: product.name,
          price: product.price,
          image: product.image || null,
        },
        ...prev,
      ];
    });
  }

  function removeItem(idOrSlug) {
    setItems((prev) => prev.filter((it) => it.id !== idOrSlug && it.slug !== idOrSlug));
  }

  return (
    <WishlistContext.Provider value={{ items, open, setOpen, isSaved, toggleItem, removeItem }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-espresso/60"
          role="dialog"
          aria-modal="true"
          aria-label="Saved wishlist items"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col bg-ivory text-espresso shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-espresso/15 bg-burgundy px-6 py-4 text-ivory">
              <div className="flex items-center gap-2">
                <HeartIcon filled className="h-5 w-5 text-gold" />
                <h2 className="text-xl !text-ivory">Saved Pieces ({items.length})</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close wishlist"
                className="p-1 text-gold hover:text-ivory"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <HeartIcon className="mx-auto h-10 w-10 text-burgundy/40" />
                  <p className="mt-3 font-serif text-2xl text-burgundy">Your wishlist is empty</p>
                  <p className="mt-2 text-sm text-espresso/75">
                    Tap the heart icon on any saree or jewellery piece to save it here for quick WhatsApp ordering.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="btn btn-primary mt-6"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-espresso/15">
                  {items.map((it) => {
                    const waHref = buildWhatsAppLink({
                      product: it,
                      qty: 1,
                    });
                    return (
                      <li key={it.id || it.slug} className="flex gap-4 py-4">
                        <Link
                          href={`/product/${it.slug}`}
                          onClick={() => setOpen(false)}
                          className="relative h-24 w-20 shrink-0 overflow-hidden bg-gold/20"
                        >
                          <Photo src={it.image} alt={it.name} sizes="80px" />
                        </Link>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/product/${it.slug}`}
                              onClick={() => setOpen(false)}
                              className="font-serif text-lg leading-snug text-burgundy hover:underline"
                            >
                              {it.name}
                            </Link>
                            {it.price !== undefined && (
                              <p className="mt-0.5 text-sm font-medium text-espresso">{inr(it.price)}</p>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-[#1F7A4C] px-3 py-1.5 text-xs font-medium text-ivory transition hover:bg-[#17603B]"
                            >
                              <WhatsAppIcon className="h-3.5 w-3.5" /> Order on WhatsApp
                            </a>
                            <button
                              type="button"
                              onClick={() => removeItem(it.id || it.slug)}
                              className="text-xs text-espresso/65 underline-offset-4 hover:text-burgundy hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function HeaderWishlistButton() {
  const { items, setOpen } = useWishlist();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={items.length > 0 ? `Saved wishlist (${items.length} items)` : 'Open wishlist'}
      className="relative p-1.5 text-gold transition-colors hover:text-ivory"
    >
      <HeartIcon filled={items.length > 0} className="h-5 w-5" />
      {items.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-espresso">
          {items.length}
        </span>
      )}
    </button>
  );
}
