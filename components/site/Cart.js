'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Photo from './Photo';
import { BagIcon, CloseIcon, WhatsAppIcon } from '@/components/Icons';
import { inr } from '@/lib/format';
import { waLink, buildCartOrderMessage } from '@/lib/whatsapp';

const CartContext = createContext(null);
const STORAGE_KEY = 'kl_cart_v1';

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      count: 0,
      total: 0,
      open: false,
      setOpen: () => {},
      addItem: () => {},
      updateQty: () => {},
      removeItem: () => {},
      clearCart: () => {},
    };
  }
  return ctx;
}

export function CartProvider({ whatsapp, children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  function addItem({ product, size = '', colour = '', qty = 1, image = null, url = '' }) {
    const key = `${product.sku}__${size}__${colour}`;
    const maxStock = Math.max(1, Math.min(Number(product.stock) || 10, 10));
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(maxStock, next[idx].qty + qty) };
        return next;
      }
      return [
        ...prev,
        {
          key,
          sku: product.sku,
          name: product.name,
          slug: product.slug || '',
          price: Number(product.price) || 0,
          size,
          colour,
          qty: Math.min(maxStock, qty),
          maxQty: maxStock,
          image,
          url,
        },
      ];
    });
    setOpen(true);
  }

  function updateQty(key, nextQty) {
    if (nextQty <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.key === key ? { ...x, qty: Math.min(x.maxQty || 10, nextQty) } : x))
    );
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const count = useMemo(() => items.reduce((sum, x) => sum + x.qty, 0), [items]);
  const total = useMemo(() => items.reduce((sum, x) => sum + Number(x.price) * x.qty, 0), [items]);

  const value = {
    items,
    count,
    total,
    open,
    setOpen,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    whatsapp,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function HeaderCartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open shopping bag (${count} items)`}
      className="relative p-1.5 text-gold transition-colors hover:text-ivory"
    >
      <BagIcon />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-burgundy">
          {count}
        </span>
      )}
    </button>
  );
}

export function FloatingCartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open shopping bag (${count} items)`}
      className="fixed bottom-[9.25rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-burgundy text-ivory shadow-lg ring-2 ring-gold transition-colors hover:bg-burgundy-dark"
    >
      <BagIcon className="h-7 w-7" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-xs font-semibold text-burgundy">
          {count}
        </span>
      )}
    </button>
  );
}

function CartDrawer() {
  const { items, count, total, open, setOpen, updateQty, removeItem, clearCart, whatsapp } = useCart();

  if (!open) return null;

  const waHref = items.length > 0 ? waLink(whatsapp, buildCartOrderMessage(items, total)) : '#';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="fixed inset-0 bg-espresso/60 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-ivory text-espresso shadow-2xl">
        <div className="flex items-center justify-between border-b border-espresso/15 bg-logo px-6 py-4 text-ivory">
          <div className="flex items-center gap-2.5">
            <BagIcon className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-2xl !text-ivory">Your Bag ({count})</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close bag"
            className="p-1 text-gold hover:text-ivory"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
              <BagIcon className="h-8 w-8" />
            </span>
            <p className="mt-4 font-serif text-2xl">Your bag is empty</p>
            <p className="mt-1 text-sm text-espresso/70">
              Browse sarees, jewellery, bangles, rings and accessories to add pieces to your bag.
            </p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-primary mt-6">
              Explore collections
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-espresso/15 overflow-y-auto px-6 py-4">
              {items.map((it) => (
                <li key={it.key} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-gold/25">
                    <Photo src={it.image} alt={it.name} sizes="80px" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        {it.slug ? (
                          <Link
                            href={`/product/${it.slug}`}
                            onClick={() => setOpen(false)}
                            className="font-serif text-lg leading-snug hover:text-burgundy"
                          >
                            {it.name}
                          </Link>
                        ) : (
                          <p className="font-serif text-lg leading-snug">{it.name}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => removeItem(it.key)}
                          aria-label={`Remove ${it.name}`}
                          className="text-xs text-espresso/50 hover:text-burgundy"
                        >
                          Remove
                        </button>
                      </div>
                      {(it.colour || it.size) && (
                        <p className="mt-0.5 text-xs text-espresso/70">
                          {[it.colour && `Colour: ${it.colour}`, it.size && `Size: ${it.size}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-burgundy">{inr(it.price)}</p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center border border-espresso/25 bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(it.key, it.qty - 1)}
                          className="h-7 w-7 text-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs">{it.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(it.key, it.qty + 1)}
                          className="h-7 w-7 text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium">{inr(Number(it.price) * it.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-espresso/15 bg-ivory-deep p-6">
              <div className="flex items-center justify-between text-lg">
                <span className="font-serif text-xl">Subtotal</span>
                <span className="font-medium text-burgundy">{inr(total)}</span>
              </div>
              <p className="mt-1 text-xs text-espresso/65">
                Order is finalised on WhatsApp once availability and delivery are confirmed.
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-4 w-full"
              >
                <WhatsAppIcon /> Order bag on WhatsApp
              </a>
              <button
                type="button"
                onClick={clearCart}
                className="mt-2 w-full py-1.5 text-center text-xs text-espresso/60 underline underline-offset-4 hover:text-burgundy"
              >
                Clear bag
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
