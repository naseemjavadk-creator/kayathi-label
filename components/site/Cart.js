'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Photo from './Photo';
import { BagIcon, ShieldCheckIcon, CloseIcon, WhatsAppIcon } from '@/components/Icons';
import { inr } from '@/lib/format';
import { waLink, buildCartOrderMessage } from '@/lib/whatsapp';
import {
  EMPTY_DELIVERY,
  INDIAN_STATES,
  cleanPhone,
  cleanPin,
  loadDelivery,
  saveDelivery,
  validateDelivery,
} from '@/lib/delivery';

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
      step: 'bag',
      setOpen: () => {},
      setStep: () => {},
      addItem: () => {},
      updateQty: () => {},
      removeItem: () => {},
      clearCart: () => {},
    };
  }
  return ctx;
}

export function CartProvider({ whatsapp = '+917907139297', children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('bag'); // 'bag' | 'form' | 'thankyou'
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

  function addItem(
    { product, size = '', colour = '', qty = 1, image = null, url = '' },
    options = {}
  ) {
    const sku = product.sku || product.id || product.slug || 'ITEM';
    const key = `${sku}__${size}__${colour}`;
    const maxStock = Math.max(1, Math.min(Number(product.stock) || 10, 10));
    const resolvedUrl =
      url ||
      (typeof window !== 'undefined' && product.slug
        ? `${window.location.origin}/product/${product.slug}`
        : '');

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
          sku,
          name: product.name,
          slug: product.slug || '',
          price: Number(product.price) || 0,
          size,
          colour,
          qty: Math.min(maxStock, qty),
          maxQty: maxStock,
          image,
          url: resolvedUrl,
        },
      ];
    });
    setStep(options.openCheckout ? 'form' : 'bag');
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
    setStep('bag');
  }

  const count = useMemo(() => items.reduce((sum, x) => sum + x.qty, 0), [items]);
  const total = useMemo(() => items.reduce((sum, x) => sum + Number(x.price) * x.qty, 0), [items]);

  const value = {
    items,
    count,
    total,
    open,
    step,
    setOpen,
    setStep,
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
  const { count, setOpen, setStep } = useCart();
  return (
    <button
      type="button"
      onClick={() => {
        setStep('bag');
        setOpen(true);
      }}
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
  const { count, setOpen, setStep } = useCart();
  return (
    <button
      type="button"
      onClick={() => {
        setStep('bag');
        setOpen(true);
      }}
      aria-label={`Open shopping bag (${count} items)`}
      className="fixed bottom-[8.25rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-ivory shadow-lg ring-2 ring-gold transition-colors hover:bg-burgundy-dark md:bottom-[9.25rem] md:right-5 md:h-14 md:w-14"
    >
      <BagIcon className="h-6 w-6 md:h-7 md:w-7" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-xs font-semibold text-burgundy">
          {count}
        </span>
      )}
    </button>
  );
}

function CartDrawer() {
  const {
    items,
    count,
    total,
    open,
    step,
    setOpen,
    setStep,
    updateQty,
    removeItem,
    clearCart,
    whatsapp,
  } = useCart();

  const [delivery, setDelivery] = useState(EMPTY_DELIVERY);
  const [submitted, setSubmitted] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState('');

  useEffect(() => {
    if (open) {
      setDelivery(loadDelivery());
    }
  }, [open]);

  useEffect(() => {
    if (items.length === 0 && step === 'form') {
      setStep('bag');
    }
  }, [items.length, step, setStep]);

  if (!open) return null;

  const { errors, isValid } = validateDelivery(delivery);

  function updateField(field, value) {
    const next = { ...delivery, [field]: value };
    setDelivery(next);
    saveDelivery(next);
  }

  function handlePlaceOrderClick() {
    if (items.length === 0) return;
    setSubmitted(false);
    setStep('form');
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const check = validateDelivery(delivery);
    if (!check.isValid || items.length === 0) {
      return;
    }
    saveDelivery(delivery);
    const message = buildCartOrderMessage(items, total, delivery);
    const targetUrl = waLink(whatsapp || '+917907139297', message);
    setLastWaUrl(targetUrl);
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    setStep('thankyou');
  }

  function handleConfirmSent() {
    clearCart();
    setSubmitted(false);
    setLastWaUrl('');
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
    >
      <div
        className="fixed inset-0 bg-espresso/60 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-ivory text-espresso shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-espresso/15 bg-logo px-6 py-4 text-ivory">
          <div className="flex items-center gap-2.5">
            <BagIcon className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-2xl !text-ivory">
              {step === 'form'
                ? 'Delivery Details'
                : step === 'thankyou'
                ? 'Order Ready on WhatsApp'
                : `Your Bag (${count})`}
            </h2>
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

        {/* STEP 1: BAG VIEW */}
        {step === 'bag' && (
          <>
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                  <BagIcon className="h-8 w-8" />
                </span>
                <p className="mt-4 font-serif text-2xl">Your bag is empty</p>
                <p className="mt-1 text-sm text-espresso/70">
                  Browse sarees, jewellery, bangles, rings and accessories to add pieces to your bag.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="btn btn-outline mt-6"
                >
                  Explore collections
                </Link>
              </div>
            ) : (
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
                        <span className="text-sm font-medium">
                          {inr(Number(it.price) * it.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-espresso/15 bg-ivory-deep p-6">
              <div className="flex items-center justify-between text-lg">
                <span className="font-serif text-xl">Subtotal</span>
                <span className="font-medium text-burgundy">{inr(total)}</span>
              </div>
              <p className="mt-1 text-xs text-espresso/65">
                Next, enter your delivery details to send your complete order on WhatsApp.
              </p>
              <button
                type="button"
                disabled={items.length === 0}
                onClick={handlePlaceOrderClick}
                className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Place order
              </button>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-2 w-full py-1.5 text-center text-xs text-espresso/60 underline underline-offset-4 hover:text-burgundy"
                >
                  Clear bag
                </button>
              )}
            </div>
          </>
        )}

        {/* STEP 2: CUSTOMER & DELIVERY DETAILS FORM */}
        {step === 'form' && (
          <form
            onSubmit={handleFormSubmit}
            noValidate
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between border-b border-espresso/15 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso/65">
                    Order Summary ({count} {count === 1 ? 'item' : 'items'})
                  </p>
                  <p className="font-serif text-xl text-burgundy">Grand Total: {inr(total)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="text-xs font-medium text-burgundy underline underline-offset-4"
                >
                  ← Edit bag
                </button>
              </div>

              <div>
                <label className="label" htmlFor="cart-name">
                  Full name <span className="text-red-700">*</span>
                </label>
                <input
                  id="cart-name"
                  className="field"
                  autoComplete="name"
                  required
                  value={delivery.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
                {submitted && errors.name && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="cart-phone">
                  Mobile number (WhatsApp) <span className="text-red-700">*</span>
                </label>
                <input
                  id="cart-phone"
                  className="field"
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g. 9876543210 or +91 9876543210"
                  autoComplete="tel"
                  required
                  value={delivery.phone}
                  onChange={(e) => updateField('phone', cleanPhone(e.target.value))}
                />
                {submitted && errors.phone && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="cart-alt-phone">
                  Alternate phone number <span className="text-espresso/50">(optional)</span>
                </label>
                <input
                  id="cart-alt-phone"
                  className="field"
                  type="tel"
                  inputMode="tel"
                  placeholder="Optional 10-digit number"
                  autoComplete="tel"
                  value={delivery.altPhone || ''}
                  onChange={(e) => updateField('altPhone', cleanPhone(e.target.value))}
                />
                {submitted && errors.altPhone && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.altPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="cart-address">
                  House/flat and street address <span className="text-red-700">*</span>
                </label>
                <textarea
                  id="cart-address"
                  rows={2}
                  className="field"
                  placeholder="House/flat no., building, street, locality"
                  autoComplete="street-address"
                  required
                  value={delivery.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                />
                {submitted && errors.address && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="cart-pin">
                    PIN code <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="cart-pin"
                    className="field"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6 digits"
                    autoComplete="postal-code"
                    required
                    value={delivery.pin}
                    onChange={(e) => updateField('pin', cleanPin(e.target.value))}
                  />
                  {submitted && errors.pin && (
                    <p role="alert" className="mt-1 text-xs text-red-700">
                      {errors.pin}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="cart-city">
                    City or town <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="cart-city"
                    className="field"
                    autoComplete="address-level2"
                    required
                    value={delivery.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                  {submitted && errors.city && (
                    <p role="alert" className="mt-1 text-xs text-red-700">
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="cart-district">
                    District <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="cart-district"
                    className="field"
                    required
                    value={delivery.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  />
                  {submitted && errors.district && (
                    <p role="alert" className="mt-1 text-xs text-red-700">
                      {errors.district}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="cart-state">
                    State <span className="text-red-700">*</span>
                  </label>
                  <select
                    id="cart-state"
                    className="field"
                    autoComplete="address-level1"
                    required
                    value={delivery.state}
                    onChange={(e) => updateField('state', e.target.value)}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {submitted && errors.state && (
                    <p role="alert" className="mt-1 text-xs text-red-700">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="cart-notes">
                  Notes <span className="text-espresso/50">(optional)</span>
                </label>
                <textarea
                  id="cart-notes"
                  rows={2}
                  className="field"
                  placeholder="Delivery instructions, landmark, or gift note (optional)"
                  value={delivery.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>

              <div className="pt-1">
                <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-espresso/85">
                  <input
                    type="checkbox"
                    checked={Boolean(delivery.consent)}
                    onChange={(e) => updateField('consent', e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-burgundy"
                  />
                  <span>
                    I consent to share my contact and delivery details with KAYATHI LABEL via
                    WhatsApp to confirm and process this order. <span className="text-red-700">*</span>
                  </span>
                </label>
                {submitted && errors.consent && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.consent}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-espresso/15 bg-ivory-deep p-6">
              {submitted && !isValid && (
                <p role="alert" className="mb-3 text-xs font-medium text-red-700">
                  Please fix the highlighted fields above before sending your order on WhatsApp.
                </p>
              )}
              <button type="submit" className="btn btn-primary w-full">
                <WhatsAppIcon /> Send order on WhatsApp ({inr(total)})
              </button>
              <button
                type="button"
                onClick={() => setStep('bag')}
                className="mt-2 w-full py-1.5 text-center text-xs text-espresso/70 underline underline-offset-4 hover:text-burgundy"
              >
                Back to bag
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: THANK-YOU & CONFIRMATION SCREEN */}
        {step === 'thankyou' && (
          <div className="flex flex-1 flex-col justify-between p-6">
            <div className="my-auto text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1F7A4C]/15 text-[#1F7A4C]">
                <ShieldCheckIcon className="h-8 w-8" />
              </span>
              <h3 className="mt-4 font-serif text-3xl text-burgundy">Thank you!</h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso/80">
                We have opened WhatsApp with your pre-filled order ({count}{' '}
                {count === 1 ? 'item' : 'items'} · {inr(total)}) and delivery details. Please tap{' '}
                <strong>Send</strong> in WhatsApp so our team can confirm availability and dispatch.
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleConfirmSent}
                  className="btn btn-primary w-full"
                >
                  I’ve sent the WhatsApp message (Clear bag)
                </button>

                {lastWaUrl && (
                  <a
                    href={lastWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline flex w-full items-center justify-center gap-2"
                  >
                    <WhatsAppIcon /> Open WhatsApp again
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="block w-full pt-2 text-center text-xs text-espresso/65 underline underline-offset-4 hover:text-burgundy"
                >
                  ← Edit delivery details or bag
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-espresso/60">
              Your bag is kept safe until you confirm your WhatsApp message was sent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
